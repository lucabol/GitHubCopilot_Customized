import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import supplierRouter, { resetSuppliers } from './supplier';
import { suppliers as seedSuppliers } from '../seedData';

let app: express.Express;

describe('Supplier API', () => {
    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/suppliers', supplierRouter);
        resetSuppliers();
    });

    it('should create a new supplier', async () => {
        const newSupplier = {
            supplierId: 100,
            name: "Test Supplier Co",
            description: "A test supplier for unit testing",
            contactPerson: "Test Person",
            email: "test@testsupplier.com",
            phone: "555-9999"
        };
        const response = await request(app).post('/suppliers').send(newSupplier);
        expect(response.status).toBe(201);
        expect(response.body).toEqual(newSupplier);
    });

    it('should get all suppliers', async () => {
        const response = await request(app).get('/suppliers');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(seedSuppliers.length);
        response.body.forEach((supplier: any, index: number) => {
            expect(supplier).toMatchObject(seedSuppliers[index]);
        });
    });

    it('should get a supplier by ID', async () => {
        const response = await request(app).get('/suppliers/1');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(seedSuppliers[0]);
    });

    it('should update a supplier by ID', async () => {
        const updatedSupplier = {
            ...seedSuppliers[0],
            name: 'Updated PurrTech Innovations',
            email: 'updated@purrtech.co'
        };
        const response = await request(app).put('/suppliers/1').send(updatedSupplier);
        expect(response.status).toBe(200);
        expect(response.body).toEqual(updatedSupplier);
    });

    it('should delete a supplier by ID', async () => {
        const response = await request(app).delete('/suppliers/1');
        expect(response.status).toBe(204);
    });

    it('should return 404 for non-existing supplier on GET', async () => {
        const response = await request(app).get('/suppliers/999');
        expect(response.status).toBe(404);
    });

    it('should return 404 for non-existing supplier on PUT', async () => {
        const updatedSupplier = {
            supplierId: 999,
            name: "Non-existent Supplier",
            description: "This should fail",
            contactPerson: "Nobody",
            email: "fail@fail.com",
            phone: "555-0000"
        };
        const response = await request(app).put('/suppliers/999').send(updatedSupplier);
        expect(response.status).toBe(404);
    });

    it('should return 404 for non-existing supplier on DELETE', async () => {
        const response = await request(app).delete('/suppliers/999');
        expect(response.status).toBe(404);
    });

    it('should verify supplier data integrity after multiple operations', async () => {
        // Create a new supplier
        const newSupplier = {
            supplierId: 50,
            name: "Integrity Test Supplier",
            description: "Testing data integrity",
            contactPerson: "Tester",
            email: "tester@test.com",
            phone: "555-1234"
        };
        await request(app).post('/suppliers').send(newSupplier);

        // Verify it exists
        let response = await request(app).get('/suppliers/50');
        expect(response.status).toBe(200);
        expect(response.body.name).toBe("Integrity Test Supplier");

        // Update it
        const updatedSupplier = { ...newSupplier, name: "Updated Integrity Supplier" };
        await request(app).put('/suppliers/50').send(updatedSupplier);

        // Verify update
        response = await request(app).get('/suppliers/50');
        expect(response.body.name).toBe("Updated Integrity Supplier");

        // Delete it
        await request(app).delete('/suppliers/50');

        // Verify deletion
        response = await request(app).get('/suppliers/50');
        expect(response.status).toBe(404);
    });
});
