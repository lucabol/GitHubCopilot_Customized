import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import productRouter, { resetProducts } from './product';
import { products as seedProducts } from '../seedData';

let app: express.Express;

describe('Product API', () => {
    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/products', productRouter);
        resetProducts();
    });

    it('should create a new product', async () => {
        const newProduct = {
            productId: 100,
            supplierId: 1,
            name: "Test Smart Cat Toy",
            description: "A test product for unit testing",
            price: 49.99,
            sku: "TEST-001",
            unit: "piece",
            imgName: "test.png"
        };
        const response = await request(app).post('/products').send(newProduct);
        expect(response.status).toBe(201);
        expect(response.body).toEqual(newProduct);
    });

    it('should get all products', async () => {
        const response = await request(app).get('/products');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(seedProducts.length);
        response.body.forEach((product: any, index: number) => {
            expect(product).toMatchObject(seedProducts[index]);
        });
    });

    it('should get a product by ID', async () => {
        const response = await request(app).get('/products/1');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(seedProducts[0]);
    });

    it('should update a product by ID', async () => {
        const updatedProduct = {
            ...seedProducts[0],
            name: 'Updated SmartFeeder Pro',
            price: 149.99
        };
        const response = await request(app).put('/products/1').send(updatedProduct);
        expect(response.status).toBe(200);
        expect(response.body).toEqual(updatedProduct);
    });

    it('should delete a product by ID', async () => {
        const response = await request(app).delete('/products/1');
        expect(response.status).toBe(204);
    });

    it('should return 404 for non-existing product on GET', async () => {
        const response = await request(app).get('/products/999');
        expect(response.status).toBe(404);
    });

    it('should return 404 for non-existing product on PUT', async () => {
        const updatedProduct = {
            productId: 999,
            supplierId: 1,
            name: "Non-existent Product",
            description: "This should fail",
            price: 10.00,
            sku: "FAIL-001",
            unit: "piece",
            imgName: "fail.png"
        };
        const response = await request(app).put('/products/999').send(updatedProduct);
        expect(response.status).toBe(404);
    });

    it('should return 404 for non-existing product on DELETE', async () => {
        const response = await request(app).delete('/products/999');
        expect(response.status).toBe(404);
    });

    it('should handle product with discount field', async () => {
        const productWithDiscount = {
            productId: 101,
            supplierId: 2,
            name: "Discounted Cat Bed",
            description: "A product with discount",
            price: 99.99,
            sku: "DISC-001",
            unit: "piece",
            imgName: "discount.png",
            discount: 0.15
        };
        const response = await request(app).post('/products').send(productWithDiscount);
        expect(response.status).toBe(201);
        expect(response.body.discount).toBe(0.15);
    });
});
