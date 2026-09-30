export const createFlagsApi = (client) => ({
  async create(flag) {
    const data = await client.request("/flags", { method: "POST", body: flag });
    return data.flag;
  },

  async list({ environmentId } = {}) {
    const query = new URLSearchParams();
    if (environmentId !== undefined) query.set("environmentId", environmentId);
    const suffix = query.size ? `?${query.toString()}` : "";
    const data = await client.request(`/flags${suffix}`);
    return data.flags;
  },

  async get(id) {
    const data = await client.request(`/flags/${encodeURIComponent(id)}`);
    return data.flag;
  },

  async update(id, updates) {
    const data = await client.request(`/flags/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: updates,
    });
    return data.flag;
  },

  remove(id) {
    return client.request(`/flags/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },
});
