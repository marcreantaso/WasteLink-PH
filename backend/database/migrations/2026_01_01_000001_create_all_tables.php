<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration 
{
    public function up(): void
    {
        // Users
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone')->unique();
            $table->string('barangay');
            $table->string('pin_hash');
            $table->text('photo_id')->nullable();
            $table->enum('role', ['worker', 'buyer', 'admin'])->default('worker');
            $table->decimal('wallet_balance', 10, 2)->default(0);
            $table->boolean('is_verified')->default(false);
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });

        // Collections
        Schema::create('collections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('material_type', ['PET', 'HDPE', 'METAL', 'PAPER', 'ORGANIC', 'OTHER']);
            $table->decimal('weight_kg', 8, 2);
            $table->text('photo')->nullable();
            $table->decimal('gps_lat', 10, 6)->nullable();
            $table->decimal('gps_lng', 10, 6)->nullable();
            $table->string('notes', 500)->nullable();
            $table->decimal('confidence', 5, 1)->nullable();
            $table->string('local_id')->nullable()->index();
            $table->string('source')->default('manual');
            $table->timestamp('synced_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index('material_type');
        });

        // Marketplace Listings
        Schema::create('marketplace_listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('material_type', ['PET', 'HDPE', 'METAL', 'PAPER', 'ORGANIC', 'OTHER']);
            $table->decimal('quantity_kg', 8, 2);
            $table->decimal('price_per_kg', 8, 2);
            $table->string('description', 500)->nullable();
            $table->enum('status', ['active', 'sold', 'cancelled'])->default('active');
            $table->timestamps();

            $table->index(['status', 'material_type']);
        });

        // Bids
        Schema::create('bids', function (Blueprint $table) {
            $table->id();
            $table->foreignId('listing_id')->constrained('marketplace_listings')->cascadeOnDelete();
            $table->foreignId('buyer_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('price', 8, 2);
            $table->enum('status', ['pending', 'accepted', 'rejected'])->default('pending');
            $table->timestamps();

            $table->index(['listing_id', 'status']);
        });

        // Earnings
        Schema::create('earnings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 10, 2);
            $table->enum('type', ['sale', 'commission', 'payout', 'bonus']);
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->string('description')->nullable();
            $table->enum('status', ['completed', 'pending', 'failed'])->default('completed');
            $table->timestamps();

            $table->index(['user_id', 'type', 'created_at']);
        });

        // Health Incidents
        Schema::create('health_incidents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['cuts', 'fumes', 'heat', 'chemical']);
            $table->enum('severity', ['low', 'medium', 'high', 'critical']);
            $table->text('description')->nullable();
            $table->decimal('gps_lat', 10, 6)->nullable();
            $table->decimal('gps_lng', 10, 6)->nullable();
            $table->boolean('alerted')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'severity']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('health_incidents');
        Schema::dropIfExists('earnings');
        Schema::dropIfExists('bids');
        Schema::dropIfExists('marketplace_listings');
        Schema::dropIfExists('collections');
        Schema::dropIfExists('users');
    }
};
