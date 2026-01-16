/**
 * @swagger
 * tags:
 *   name: Products
 *   description: API endpoints for managing products
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Returns all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of all products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 * 
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       204:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */

import express from 'express';
import { Product } from '../models/product';
import { products as seedProducts } from '../seedData';

const router = express.Router();

let products: Product[] = [...seedProducts];

// Create a new product
router.post('/', (req, res) => {
  const newProduct: Product = {
    ...req.body,
    productId: Math.max(...products.map(p => p.productId), 0) + 1,
    createdAt: req.body.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastStockUpdate: req.body.lastStockUpdate || new Date().toISOString()
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// Get all products
router.get('/', (req, res) => {
  res.json(products);
});

// Get a product by ID
router.get('/:id', (req, res) => {
  const product = products.find(p => p.productId === parseInt(req.params.id));
  if (product) {
    res.json(product);
  } else {
    res.status(404).send('Product not found');
  }
});

// Update a product by ID
router.put('/:id', (req, res) => {
  const index = products.findIndex(p => p.productId === parseInt(req.params.id));
  if (index !== -1) {
    products[index] = {
      ...req.body,
      productId: parseInt(req.params.id),
      updatedAt: new Date().toISOString()
    };
    res.json(products[index]);
  } else {
    res.status(404).send('Product not found');
  }
});

// Delete a product by ID
router.delete('/:id', (req, res) => {
  const index = products.findIndex(p => p.productId === parseInt(req.params.id));
  if (index !== -1) {
    products.splice(index, 1);
    res.status(204).send();
  } else {
    res.status(404).send('Product not found');
  }
});

// Bulk update products
router.post('/bulk-update', (req, res) => {
  const { productIds, updates } = req.body;
  const updatedProducts = [];
  
  for (const id of productIds) {
    const index = products.findIndex(p => p.productId === id);
    if (index !== -1) {
      products[index] = { 
        ...products[index], 
        ...updates,
        updatedAt: new Date().toISOString(),
        lastStockUpdate: updates.stockLevel !== undefined ? new Date().toISOString() : products[index].lastStockUpdate
      };
      updatedProducts.push(products[index]);
    }
  }
  
  res.json({ updated: updatedProducts.length, products: updatedProducts });
});

// Bulk delete products
router.delete('/bulk-delete', (req, res) => {
  const { productIds } = req.body;
  const deletedCount = productIds.length;
  
  products = products.filter(p => !productIds.includes(p.productId));
  
  res.json({ deleted: deletedCount });
});

// Export products
router.get('/export', (req, res) => {
  const format = req.query.format || 'json';
  
  if (format === 'csv') {
    // CSV export
    const headers = ['productId', 'name', 'description', 'price', 'sku', 'unit', 'stockLevel', 'supplierId', 'discount', 'createdAt', 'updatedAt', 'lastStockUpdate'];
    const csvData = [
      headers.join(','),
      ...products.map(p => headers.map(h => {
        const value = p[h as keyof Product];
        // Escape commas and quotes in values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(','))
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
    res.send(csvData);
  } else {
    // JSON export
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=products.json');
    res.json(products);
  }
});

// Import products
router.post('/import', (req, res) => {
  const { products: importedProducts } = req.body;
  const errors = [];
  const imported = [];
  
  for (const product of importedProducts) {
    // Validate required fields
    if (!product.name || !product.price || !product.sku) {
      errors.push({ product, error: 'Missing required fields' });
      continue;
    }
    
    // Generate new ID if not provided
    const productId = product.productId || Math.max(...products.map(p => p.productId), 0) + 1;
    const newProduct = {
      ...product,
      productId,
      createdAt: product.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastStockUpdate: product.lastStockUpdate || new Date().toISOString()
    };
    
    products.push(newProduct);
    imported.push(newProduct);
  }
  
  res.json({ imported: imported.length, errors: errors.length, products: imported, errorDetails: errors });
});

// Get aggregate statistics
router.get('/stats', (req, res) => {
  const totalProducts = products.length;
  const inStock = products.filter(p => p.stockLevel > 10).length;
  const lowStock = products.filter(p => p.stockLevel > 0 && p.stockLevel <= 10).length;
  const outOfStock = products.filter(p => p.stockLevel === 0).length;
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.price * p.stockLevel), 0);
  
  res.json({
    totalProducts,
    inStock,
    lowStock,
    outOfStock,
    totalInventoryValue
  });
});

export default router;
