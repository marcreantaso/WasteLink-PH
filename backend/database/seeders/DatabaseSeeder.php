<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Collection;
use App\Models\MarketplaceListing;
use App\Models\Bid;
use App\Models\Earning;
use App\Models\HealthIncident;

class DatabaseSeeder extends Seeder
{
    // Barangays in Santa Rosa, Laguna
    private const BARANGAYS = [
        'Aplaya', 'Balibago', 'Caingin', 'Dila', 'Dita',
        'Don Jose', 'Ibaba', 'Kanluran', 'Labas', 'Macabling',
        'Malitlit', 'Malusak', 'Market Area', 'Pook', 'Pulong Santa Cruz',
        'Santo Domingo', 'Sinalhan', 'Tagapo', 'Poblacion',
    ];

    private const MATERIALS = ['PET', 'HDPE', 'METAL', 'PAPER', 'ORGANIC', 'OTHER'];

    private const FILIPINO_NAMES = [
        'Maria Santos', 'Juan dela Cruz', 'Rosa Jimenez', 'Pedro Ramos', 'Ana Reyes',
        'Jose Garcia', 'Carmen Lopez', 'Ricardo Cruz', 'Elena Torres', 'Fernando Bautista',
        'Lorna Mendoza', 'Roberto Soriano', 'Cristina Aquino', 'Antonio Villanueva', 'Gloria Pascual',
        'Mario Fernandez', 'Teresa Aguilar', 'Carlos Navarro', 'Dolores Rivera', 'Ernesto Santiago',
        'Marites Evangelista', 'Ramon Dominguez', 'Paz Salazar', 'Danilo Castillo', 'Rosario Mercado',
        'Eduardo Valdez', 'Ligaya Panganiban', 'Jaime Flores', 'Leonora Roque', 'Armando Manalo',
        'Edna Gutierrez', 'Gregorio de Leon', 'Maricel Padilla', 'Nestor Ocampo', 'Corazon Diaz',
        'Alfredo Morales', 'Luzviminda Hernandez', 'Emilio Serrano', 'Norma Tolentino', 'Virgilio Castro',
        'Myrna Espiritu', 'Benjamin Ignacio', 'Remedios Magsaysay', 'Reynaldo Alvarez', 'Josefina Luna',
        'Salvador Galang', 'Teresita Lazaro', 'Cesar Villaruz', 'Aurora Sibayan', 'Leonardo Dimaculangan',
    ];

    public function run(): void
    {
        $this->command->info('Seeding WasteLink PH database...');

        // Create 50 waste worker users
        $users = [];
        foreach (self::FILIPINO_NAMES as $i => $name) {
            $users[] = User::create([
                'name' => $name,
                'phone' => '+6391' . str_pad($i + 1, 8, '0', STR_PAD_LEFT),
                'barangay' => self::BARANGAYS[$i % count(self::BARANGAYS)],
                'pin_hash' => Hash::make('1234'),
                'role' => $i < 3 ? 'admin' : ($i < 8 ? 'buyer' : 'worker'),
                'wallet_balance' => rand(100, 5000) / 1,
                'is_verified' => $i < 30,
                'verified_at' => $i < 30 ? now()->subDays(rand(1, 30)) : null,
            ]);
        }

        $this->command->info('✓ Created 50 users');

        // Collections (~5 per user)
        $collectionCount = 0;
        foreach ($users as $user) {
            if ($user->role !== 'worker')
                continue;

            $numCollections = rand(3, 8);
            for ($j = 0; $j < $numCollections; $j++) {
                Collection::create([
                    'user_id' => $user->id,
                    'material_type' => self::MATERIALS[array_rand(self::MATERIALS)],
                    'weight_kg' => rand(10, 500) / 10,
                    'gps_lat' => 14.3100 + (rand(0, 100) / 10000), // Santa Rosa area
                    'gps_lng' => 121.1100 + (rand(0, 100) / 10000),
                    'source' => rand(0, 1) ? 'manual' : 'ai_scan',
                    'confidence' => rand(750, 980) / 10,
                    'synced_at' => now()->subDays(rand(0, 14)),
                    'created_at' => now()->subDays(rand(0, 30)),
                ]);
                $collectionCount++;
            }
        }
        $this->command->info("✓ Created {$collectionCount} collections");

        // Marketplace listings (from workers)
        $listingCount = 0;
        $workers = array_filter($users, fn($u) => $u->role === 'worker');
        foreach (array_slice($workers, 0, 20) as $worker) {
            $material = self::MATERIALS[array_rand(self::MATERIALS)];
            $prices = ['PET' => 15, 'HDPE' => 12, 'METAL' => 25, 'PAPER' => 8, 'ORGANIC' => 2, 'OTHER' => 3];

            $listing = MarketplaceListing::create([
                'user_id' => $worker->id,
                'material_type' => $material,
                'quantity_kg' => rand(5, 50),
                'price_per_kg' => $prices[$material] + rand(-3, 5),
                'status' => ['active', 'active', 'active', 'sold'][rand(0, 3)],
            ]);
            $listingCount++;

            // Bids from buyers
            $buyers = array_filter($users, fn($u) => $u->role === 'buyer');
            foreach (array_slice($buyers, 0, rand(1, 3)) as $buyer) {
                Bid::create([
                    'listing_id' => $listing->id,
                    'buyer_id' => $buyer->id,
                    'price' => $prices[$material] + rand(-2, 8),
                    'status' => 'pending',
                ]);
            }
        }
        $this->command->info("✓ Created {$listingCount} marketplace listings with bids");

        // Earnings for workers
        $earningCount = 0;
        foreach (array_slice($workers, 0, 30) as $worker) {
            for ($j = 0; $j < rand(3, 10); $j++) {
                $amount = rand(50, 500);
                Earning::create([
                    'user_id' => $worker->id,
                    'amount' => $amount,
                    'type' => 'sale',
                    'description' => 'Sale of ' . self::MATERIALS[array_rand(self::MATERIALS)],
                    'created_at' => now()->subDays(rand(0, 30)),
                ]);

                // Commission
                Earning::create([
                    'user_id' => $worker->id,
                    'amount' => -($amount * 0.05),
                    'type' => 'commission',
                    'description' => '5% platform commission',
                    'created_at' => now()->subDays(rand(0, 30)),
                ]);
                $earningCount += 2;
            }
        }
        $this->command->info("✓ Created {$earningCount} earning records");

        // Health incidents
        $incidentTypes = ['cuts', 'fumes', 'heat', 'chemical'];
        $severities = ['low', 'medium', 'high', 'critical'];
        $incidentCount = 0;
        foreach (array_slice($workers, 0, 15) as $worker) {
            HealthIncident::create([
                'user_id' => $worker->id,
                'type' => $incidentTypes[array_rand($incidentTypes)],
                'severity' => $severities[array_rand($severities)],
                'description' => 'Auto-generated incident for seed data',
                'gps_lat' => 14.3100 + (rand(0, 100) / 10000),
                'gps_lng' => 121.1100 + (rand(0, 100) / 10000),
                'alerted' => rand(0, 1),
                'created_at' => now()->subDays(rand(0, 14)),
            ]);
            $incidentCount++;
        }
        $this->command->info("✓ Created {$incidentCount} health incidents");

        $this->command->info('');
        $this->command->info('🎉 Seeding complete! All 50 users have PIN: 1234');
    }
}
