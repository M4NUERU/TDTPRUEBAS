import { DEMO_DATA } from '../utils/demoData';

// Helper to simulate network delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

class DemoQueryBuilder {
    constructor(table, data) {
        this.table = table;
        this.data = [...(data || [])];
        this.filters = [];
        this.error = null;
        this.singleResult = false;
        this.action = 'select'; // select, insert, update, delete
        this.payload = null;
    }

    select(columns = '*') {
        this.action = 'select';
        return this;
    }

    insert(payload) {
        this.action = 'insert';
        this.payload = Array.isArray(payload) ? payload : [payload];
        return this;
    }

    upsert(payload) {
        this.action = 'upsert';
        this.payload = Array.isArray(payload) ? payload : [payload];
        return this;
    }

    update(payload) {
        this.action = 'update';
        this.payload = payload;
        return this;
    }

    delete() {
        this.action = 'delete';
        return this;
    }

    eq(column, value) {
        this.filters.push({ type: 'eq', column, value });
        return this;
    }

    order(column, { ascending = true } = {}) {
        this.sort = { column, ascending };
        return this;
    }

    single() {
        this.singleResult = true;
        return this;
    }

    // Execute logic
    async then(resolve, reject) {
        await delay();

        // Filter Logic
        let filtered = this.data;
        for (const f of this.filters) {
            if (f.type === 'eq') {
                filtered = filtered.filter(item => item[f.column] == f.value);
            }
        }

        let resultData = null;

        try {
            switch (this.action) {
                case 'select':
                    if (this.sort) {
                        filtered.sort((a, b) => {
                            if (a[this.sort.column] < b[this.sort.column]) return this.sort.ascending ? -1 : 1;
                            if (a[this.sort.column] > b[this.sort.column]) return this.sort.ascending ? 1 : -1;
                            return 0;
                        });
                    }
                    resultData = this.singleResult ? (filtered[0] || null) : filtered;
                    // Mock joins? Too complex for this simple helper. 
                    // We assume hooks handle data structure or we provided denormalized data in DEMO_DATA if strictly needed.
                    break;

                case 'insert':
                    const newItems = this.payload.map(item => ({ ...item, id: item.id || Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString() }));
                    // In a real app we'd update DEMO_DATA, but imports are read-only.
                    // We can check if we want persistent demo session or just success response.
                    // For this MVP, we just return success with the new data.
                    resultData = newItems;
                    break;

                case 'update':
                    resultData = filtered.map(item => ({ ...item, ...this.payload }));
                    break;

                case 'upsert':
                    // Mock upsert: if ID exists update, else insert
                    resultData = this.payload.map(item => ({ ...item, id: item.id || Math.random().toString(36).substr(2, 9) }));
                    break;

                case 'delete':
                    resultData = filtered; // Returned deleted rows
                    break;
            }

            resolve({ data: resultData, error: null });

        } catch (e) {
            resolve({ data: null, error: { message: e.message } });
        }
    }
}

export const demoService = {
    from: (table) => {
        // We load from the exported object. 
        // Note: This data is static per page load unless we move it to a stateful module or localStorage.
        // For a simple demo "happy path", static success responses are often enough.
        return new DemoQueryBuilder(table, DEMO_DATA[table] || []);
    },

    auth: {
        signInWithPassword: async ({ email, password }) => {
            await delay(800);
            return {
                data: {
                    user: {
                        id: 'demo-admin',
                        email: 'demo@todotejidos.com',
                        rol: 'ADMIN',
                        user_metadata: { nombre: 'Usuario Demo' } // Standard Supabase structure
                    },
                    session: { access_token: 'mock-token' }
                },
                error: null
            };
        },
        signOut: async () => {
            await delay(200);
            return { error: null };
        },
        getSession: async () => {
            return { data: { session: null }, error: null };
        }
    },

    channel: () => ({
        on: () => ({ subscribe: () => { } }),
        subscribe: () => { }
    })
};
