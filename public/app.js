// Minimal module explorer + naive form generator for the schema format.
// This lets you view available modules and fetch their schema.
// The Generate & Sync action expects a server-side `/api/modules/:name/generate` (not implemented here).
async function apiGet(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error('API error ' + res.status);
  return res.json();
}

function el(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  if (attrs.class) e.className = attrs.class;
  Object.entries(attrs).forEach(([k,v]) => { if (k !== 'class') e.setAttribute(k, v); });
  children.forEach(c => typeof c === 'string' ? e.appendChild(document.createTextNode(c)) : e.appendChild(c));
  return e;
}

async function loadModules() {
  try {
    const modules = await apiGet('/api/modules');
    const list = document.getElementById('modulesList');
    list.innerHTML = '';
    modules.forEach(m => {
      const li = el('li', {}, [
        el('button', { class: 'w-full text-left p-2 rounded hover:bg-gray-100' }, [m.name])
      ]);
      li.querySelector('button').onclick = () => openModule(m.name);
      list.appendChild(li);
    });
  } catch (e) {
    alert('Failed to load modules: ' + e.message);
  }
}

async function openModule(name) {
  const schema = await apiGet('/api/modules/' + encodeURIComponent(name) + '/schema');
  const editor = document.getElementById('moduleEditor');
  editor.innerHTML = '';
  const title = el('h2', { class: 'text-xl font-semibold mb-3' }, [schema.title || name]);
  const form = el('form', { class: 'space-y-3' }, []);
  buildFormFields(form, schema.fields || {});
  const saveBtn = el('button', { class: 'bg-blue-600 text-white px-4 py-2 rounded' }, ['Generate & Sync']);
  saveBtn.type = 'button';
  saveBtn.onclick = async () => {
    const payload = {}; // gather form values - simple stub for now
    try {
      const resp = await fetch(`/api/modules/${encodeURIComponent(name)}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) throw new Error('Generate failed: ' + resp.status);
      const data = await resp.json();
      alert('Generated: ' + JSON.stringify(data));
    } catch (e) {
      alert('Generation failed: ' + e.message);
    }
  };

  form.appendChild(saveBtn);
  editor.appendChild(title);
  editor.appendChild(form);
}

function buildFormFields(container, fields, prefix = '') {
  Object.entries(fields).forEach(([key, def]) => {
    const id = prefix + key;
    if (def.type === 'string' || def.type === 'number' || def.type === 'boolean') {
      const label = el('label', { class: 'block text-sm font-medium text-gray-700' }, [def.label || key]);
      const input = document.createElement('input');
      input.name = id;
      input.className = 'mt-1 block w-full p-2 border rounded';
      input.value = def.default || '';
      if (def.type === 'number') input.type = 'number';
      if (def.type === 'boolean') input.type = 'checkbox';
      container.appendChild(label);
      container.appendChild(input);
    } else if (def.type === 'list') {
      const label = el('label', { class: 'block text-sm font-medium text-gray-700' }, [def.label || key]);
      const wrapper = el('div', { class: 'space-y-2' }, []);
      const addBtn = el('button', { class: 'bg-green-500 text-white px-2 py-1 rounded' }, ['Add item']);
      addBtn.type = 'button';
      addBtn.onclick = () => {
        wrapper.appendChild(buildListItem(def.item));
      };
      container.appendChild(label);
      container.appendChild(addBtn);
      container.appendChild(wrapper);
    } else if (def.type === 'object') {
      const lbl = el('div', { class: 'font-semibold mt-3' }, [def.label || key]);
      container.appendChild(lbl);
      buildFormFields(container, def.fields || {}, id + '.');
    }
  });
}

function buildListItem(itemSchema) {
  const box = el('div', { class: 'p-2 border rounded bg-gray-50' }, []);
  buildFormFields(box, itemSchema, '');
  const rm = el('button', { class: 'text-sm text-red-600 mt-2' }, ['Remove']);
  rm.type = 'button';
  rm.onclick = () => box.remove();
  box.appendChild(rm);
  return box;
}

loadModules();
