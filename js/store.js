/* =====================================================================
   store.js — طبقة البيانات
   - SupabaseStore: قاعدة البيانات المشتركة (الوضع الأساسي)
   - PreviewStore: معاينة محلية فقط، لا تُستخدم إلا إذا كان mode = "preview"
   ===================================================================== */
(function () {
  'use strict';

  const BUCKET = 'product-images';

  // البيانات الأساسية نفسها الموجودة في schema.sql (للمعاينة فقط)
  const SEED = {
    members: [
      { id: 'raghad', name: 'رغد', gender: 'f', sort_order: 1 },
      { id: 'lina', name: 'لينا', gender: 'f', sort_order: 2 },
      { id: 'aleen', name: 'ألين', gender: 'f', sort_order: 3 },
      { id: 'afaf', name: 'عفاف', gender: 'f', sort_order: 4 },
      { id: 'adel', name: 'عادل', gender: 'm', sort_order: 5 },
      { id: 'salman', name: 'سلمان', gender: 'm', sort_order: 6 },
      { id: 'rawan', name: 'روان', gender: 'f', sort_order: 7 },
      { id: 'naif', name: 'نايف', gender: 'm', sort_order: 8 },
    ],
    sections: [
      { id: 'pharmacy', name: 'الصيدلية', sort_order: 1 },
      { id: 'makeup', name: 'المكياج', sort_order: 2 },
      { id: 'perfumes', name: 'العطور', sort_order: 3 },
      { id: 'bags', name: 'الشنط', sort_order: 4 },
      { id: 'fashion', name: 'الملابس', sort_order: 5 },
      { id: 'gifts', name: 'الإكسسوارات', sort_order: 6 },
    ],
    categories: {
      pharmacy: ['العناية بالوجه', 'التصبغات وتوحيد اللون', 'الهالات والعناية بالعين', 'العناية بالجسم', 'المناطق الحساسة',
        'العناية بالشعر', 'الرموش والحواجب', 'الأظافر', 'الأسنان والفم', 'العناية الشخصية', 'المكملات والفيتامينات', 'منتجات أخرى'],
      makeup: ['الوجه', 'العيون', 'الشفاه', 'الحواجب', 'الفرش والأدوات', 'منتجات أخرى'],
    },
  };

  const uuid = () => (crypto.randomUUID ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0; return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    }));

  function fail(error, fallback) {
    const e = new Error((error && error.message) || fallback || 'request_failed');
    e.cause = error;
    return e;
  }

  function normalizeProduct(row) {
    const links = row.product_members || [];
    const p = Object.assign({}, row);
    delete p.product_members;
    p.member_ids = links.map((l) => l.member_id);
    p.price = p.price === null || p.price === undefined || p.price === '' ? null : Number(p.price);
    return p;
  }

  // =================================================================
  //  Supabase
  // =================================================================
  class SupabaseStore {
    constructor(cfg) {
      this.cfg = cfg;
      this.kind = 'supabase';
      this.needsLogin = (cfg.authMode || 'password') !== 'open';
      this.sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, {
        auth: { persistSession: true, autoRefreshToken: true, storageKey: 'wishlist-auth' },
        realtime: { params: { eventsPerSecond: 5 } },
      });
      this.channel = null;
    }

    async getSession() {
      if (!this.needsLogin) return { open: true };
      const { data } = await this.sb.auth.getSession();
      return data ? data.session : null;
    }

    async signIn(password) {
      const { error } = await this.sb.auth.signInWithPassword({ email: this.cfg.familyEmail, password });
      if (error) throw fail(error, 'login_failed');
    }

    async signOut() {
      if (this.channel) { await this.sb.removeChannel(this.channel); this.channel = null; }
      await this.sb.auth.signOut();
    }

    onAuthLost(cb) {
      if (!this.needsLogin) return;
      this.sb.auth.onAuthStateChange((event, session) => { if (event === 'SIGNED_OUT' || (!session && event !== 'INITIAL_SESSION')) cb(); });
    }

    async loadAll() {
      const [m, s, c, p] = await Promise.all([
        this.sb.from('members').select('*').order('sort_order'),
        this.sb.from('sections').select('*').order('sort_order'),
        this.sb.from('categories').select('*').order('sort_order').order('created_at'),
        this.sb.from('products').select('*, product_members(member_id)').order('created_at', { ascending: false }),
      ]);
      for (const r of [m, s, c, p]) if (r.error) throw fail(r.error, 'load_failed');
      return { members: m.data, sections: s.data, categories: c.data, products: p.data.map(normalizeProduct) };
    }

    subscribe(onChange, onStatus) {
      const ch = this.sb.channel('wishlist-db');
      for (const table of ['products', 'product_members', 'categories']) {
        ch.on('postgres_changes', { event: '*', schema: 'public', table }, () => onChange());
      }
      ch.subscribe((status) => onStatus && onStatus(status));
      this.channel = ch;
    }

    async saveProduct(id, data, memberIds) {
      const { data: newId, error } = await this.sb.rpc('save_product', {
        p_id: id || null, p_data: data, p_member_ids: memberIds,
      });
      if (error) throw fail(error, 'save_failed');
      return newId;
    }

    async setPurchased(id, purchased) {
      const patch = { purchased: !!purchased, purchased_at: purchased ? new Date().toISOString() : null };
      const { error } = await this.sb.from('products').update(patch).eq('id', id);
      if (error) throw fail(error, 'purchase_failed');
    }

    async deleteProduct(product) {
      const { error } = await this.sb.from('products').delete().eq('id', product.id);
      if (error) throw fail(error, 'delete_failed');
      if (product.image_path) this.removeImage(product.image_path);
    }

    async addCategory(sectionId, name) {
      const { data, error } = await this.sb.from('categories')
        .insert({ section_id: sectionId, name, sort_order: 200 })
        .select().single();
      if (error) throw fail(error, String(error.code) === '23505' ? 'category_exists' : 'category_failed');
      return data;
    }

    async uploadImage(blob) {
      const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg';
      const path = `products/${uuid()}.${ext}`;
      const { error } = await this.sb.storage.from(BUCKET).upload(path, blob, {
        contentType: blob.type || 'image/jpeg', cacheControl: '31536000', upsert: false,
      });
      if (error) throw fail(error, 'upload_failed');
      return path;
    }

    async removeImage(path) {
      try { await this.sb.storage.from(BUCKET).remove([path]); } catch (e) { console.warn('image cleanup', e); }
    }

    imageUrl(path) {
      if (!path) return '';
      return this.sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    }
  }

  // =================================================================
  //  Preview (هذا الجهاز فقط — للمعاينة قبل ربط Supabase)
  // =================================================================
  class PreviewStore {
    constructor() {
      this.kind = 'preview';
      this.needsLogin = false;
      this.key = 'wishlist-preview-v2';
      this.mem = null;
      try { localStorage.setItem('wishlist-probe', '1'); localStorage.removeItem('wishlist-probe'); this.canStore = true; } catch (e) { this.canStore = false; }
      try { this.bc = new BroadcastChannel('wishlist-preview'); } catch (e) { this.bc = null; }
    }
    _read() {
      let db = null;
      if (this.canStore) { try { db = JSON.parse(localStorage.getItem(this.key) || 'null'); } catch (e) { db = null; } }
      else db = this.mem;
      if (!db) {
        const cats = [];
        for (const sid of Object.keys(SEED.categories)) {
          SEED.categories[sid].forEach((name, i, arr) => cats.push({ id: uuid(), section_id: sid, name, sort_order: i === arr.length - 1 ? 999 : i + 1, created_at: new Date().toISOString() }));
        }
        db = { categories: cats, products: [] };
        this._write(db, false);
      }
      return db;
    }
    _write(db, notify = true) {
      if (!this.canStore) { this.mem = db; return; }
      try { localStorage.setItem(this.key, JSON.stringify(db)); }
      catch (e) { throw new Error('storage_full'); }
      if (notify && this.bc) this.bc.postMessage('changed');
    }
    async getSession() { return { open: true }; }
    async signIn() {}
    async signOut() {}
    onAuthLost() {}
    async loadAll() {
      const db = this._read();
      return {
        members: SEED.members.slice(), sections: SEED.sections.slice(),
        categories: db.categories.slice().sort((a, b) => a.sort_order - b.sort_order),
        products: db.products.slice().sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).map((p) => Object.assign({}, p, { member_ids: p.member_ids.slice() })),
      };
    }
    subscribe(onChange, onStatus) {
      if (this.bc) this.bc.onmessage = () => onChange();
      window.addEventListener('storage', (e) => { if (e.key === this.key) onChange(); });
      setTimeout(() => onStatus && onStatus('SUBSCRIBED'), 50);
    }
    async saveProduct(id, data, memberIds) {
      if (!memberIds || !memberIds.length) throw new Error('member_required');
      const db = this._read();
      const now = new Date().toISOString();
      const clean = (v) => { const s = (v === undefined || v === null) ? '' : String(v).trim(); return s === '' ? null : s; };
      const fields = {
        section_id: data.section_id, category_id: clean(data.category_id), name: String(data.name || '').trim(),
        description: clean(data.description), image_path: clean(data.image_path),
        is_shared: !!data.is_shared || memberIds.length > 1, member_ids: memberIds.slice(),
      };
      if (!fields.name) throw new Error('name_required');
      if (id) {
        const p = db.products.find((x) => x.id === id);
        if (!p) throw new Error('product_not_found');
        Object.assign(p, fields, { updated_at: now });
      } else {
        id = uuid();
        db.products.push(Object.assign({ id, purchased: false, purchased_at: null, created_at: now, updated_at: now }, fields));
      }
      this._write(db);
      return id;
    }
    async setPurchased(id, purchased) {
      const db = this._read();
      const p = db.products.find((x) => x.id === id);
      if (!p) throw new Error('product_not_found');
      Object.assign(p, { purchased: !!purchased, purchased_at: purchased ? new Date().toISOString() : null });
      this._write(db);
    }
    async deleteProduct(product) {
      const db = this._read();
      db.products = db.products.filter((x) => x.id !== product.id);
      this._write(db);
    }
    async addCategory(sectionId, name) {
      const db = this._read();
      if (db.categories.some((c) => c.section_id === sectionId && c.name === name)) throw new Error('category_exists');
      const c = { id: uuid(), section_id: sectionId, name, sort_order: 200, created_at: new Date().toISOString() };
      db.categories.push(c);
      this._write(db);
      return c;
    }
    async uploadImage(blob) {
      return await new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result);
        fr.onerror = () => reject(new Error('upload_failed'));
        fr.readAsDataURL(blob);
      });
    }
    async removeImage() {}
    imageUrl(path) { return path || ''; }
  }

  window.WishStore = {
    create(cfg) {
      if (cfg.mode === 'preview') return new PreviewStore();
      return new SupabaseStore(cfg);
    },
    SEED,
  };
})();
