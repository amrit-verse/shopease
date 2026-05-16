// In-memory drop-in for Mongoose models. Used only when MONGO_URI is unset
// (e.g. for the Replit preview / quick demos). The real Mongoose models are
// used in any environment that has a MongoDB connection string configured.
//
// We mimic just the slice of Mongoose's API the controllers actually call:
//   Model.find(filter).sort(spec)
//   Model.findOne(filter)
//   Model.findById(id).select(fields)
//   Model.create(data)
//   Model.countDocuments()
//   doc.save()
//   doc.deleteOne()
//   doc.toJSON()

import { randomUUID } from "node:crypto";

const matchValue = (val, query) => {
  if (query !== null && typeof query === "object" && !Array.isArray(query)) {
    if (query.$regex !== undefined) {
      const re = new RegExp(query.$regex, query.$options || "");
      return typeof val === "string" && re.test(val);
    }
    if (query.$in !== undefined) {
      return query.$in.some((q) => String(q) === String(val));
    }
  }
  return String(query) === String(val);
};

const matchDoc = (doc, filter) =>
  Object.entries(filter).every(([k, v]) => matchValue(doc[k], v));

class Query {
  constructor(exec) {
    this._exec = exec;
    this._sort = null;
  }
  sort(spec) {
    this._sort = spec;
    return this;
  }
  select() {
    // controllers rely on toJSON to strip sensitive fields, so this is a no-op
    return this;
  }
  then(resolve, reject) {
    return Promise.resolve()
      .then(this._exec)
      .then((result) => {
        if (Array.isArray(result) && this._sort) {
          const [field, dir] = Object.entries(this._sort)[0];
          result = [...result].sort((a, b) => {
            const av = a[field];
            const bv = b[field];
            if (av < bv) return dir > 0 ? -1 : 1;
            if (av > bv) return dir > 0 ? 1 : -1;
            return 0;
          });
        }
        return result;
      })
      .then(resolve, reject);
  }
}

export function createMemoryModel({
  name,
  defaults = {},
  preSave,
  methods = {},
  toJSON,
}) {
  const collection = new Map();

  const wrap = (raw) => {
    const doc = { ...raw };
    for (const [k, fn] of Object.entries(methods)) {
      doc[k] = fn.bind(doc);
    }
    doc.save = async () => {
      if (preSave) await preSave.call(doc);
      collection.set(String(doc._id), { ...doc });
      return doc;
    };
    doc.deleteOne = async () => {
      collection.delete(String(doc._id));
    };
    doc.toJSON = () => (toJSON ? toJSON(doc) : { ...doc });
    doc.toObject = () => ({ ...doc });
    return doc;
  };

  const create = async (data) => {
    const now = new Date();
    const raw = {
      ...defaults,
      ...data,
      _id: data._id || randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    const doc = wrap(raw);
    if (preSave) await preSave.call(doc);
    collection.set(String(doc._id), { ...doc });
    return doc;
  };

  return {
    modelName: name,
    _collection: collection,
    find(filter = {}) {
      return new Query(() =>
        [...collection.values()].filter((d) => matchDoc(d, filter)).map(wrap),
      );
    },
    async findOne(filter = {}) {
      const found = [...collection.values()].find((d) => matchDoc(d, filter));
      return found ? wrap(found) : null;
    },
    findById(id) {
      return new Query(() => {
        const found = collection.get(String(id));
        return found ? wrap(found) : null;
      });
    },
    create,
    async insertMany(docs) {
      const out = [];
      for (const d of docs) out.push(await create(d));
      return out;
    },
    async countDocuments(filter = {}) {
      return [...collection.values()].filter((d) => matchDoc(d, filter)).length;
    },
  };
}

export const isMemoryMode = () => !process.env.MONGO_URI;
