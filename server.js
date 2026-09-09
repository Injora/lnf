const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const ITEMS_FILE = path.join(__dirname, 'items.json');

const getItems = () => {
  if (!fs.existsSync(ITEMS_FILE)) {
    fs.writeFileSync(ITEMS_FILE, '[]', 'utf8');
  }
  const data = fs.readFileSync(ITEMS_FILE, 'utf8');
  return JSON.parse(data || '[]');
};

const saveItems = (items) => {
  fs.writeFileSync(ITEMS_FILE, JSON.stringify(items, null, 2), 'utf8');
};

app.post('/api/items', (req, res) => {
  const { itemName, type, place, date, contact } = req.body;
  if (!itemName || !type || !place || !date || !contact) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (type !== 'lost' && type !== 'found') {
    return res.status(400).json({ error: 'Type must be lost or found' });
  }

  const items = getItems();
  const newItem = {
    id: crypto.randomUUID(),
    itemName,
    type,
    place,
    date,
    contact,
    status: 'open'
  };

  items.push(newItem);
  saveItems(items);

  res.status(201).json(newItem);
});

app.get('/api/items', (req, res) => {
  let items = getItems();
  items.reverse();

  const { type, status, place } = req.query;

  if (type) {
    items = items.filter(item => item.type === type);
  }
  if (status) {
    items = items.filter(item => item.status === status);
  }
  if (place) {
    const placeLower = place.toLowerCase();
    items = items.filter(item => item.place.toLowerCase().includes(placeLower));
  }

  res.json(items);
});

app.get('/api/items/:id', (req, res) => {
  const items = getItems();
  const item = items.find(i => i.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.json(item);
});

app.put('/api/items/:id', (req, res) => {
  const { itemName, type, place, date, contact } = req.body;
  if (!itemName || !type || !place || !date || !contact) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (type !== 'lost' && type !== 'found') {
    return res.status(400).json({ error: 'Type must be lost or found' });
  }

  const items = getItems();
  const index = items.findIndex(i => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Not found' });
  }

  items[index] = {
    id: items[index].id,
    status: items[index].status,
    itemName,
    type,
    place,
    date,
    contact
  };

  saveItems(items);
  res.json(items[index]);
});

app.patch('/api/items/:id/claim', (req, res) => {
  const items = getItems();
  const index = items.findIndex(i => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Not found' });
  }
  if (items[index].status === 'claimed') {
    return res.status(409).json({ error: 'Already claimed' });
  }

  items[index].status = 'claimed';
  saveItems(items);
  res.json(items[index]);
});

app.delete('/api/items/:id', (req, res) => {
  let items = getItems();
  const index = items.findIndex(i => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Not found' });
  }

  items.splice(index, 1);
  saveItems(items);
  res.status(204).send();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
