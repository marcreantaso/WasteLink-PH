<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CollectionController;
use App\Http\Controllers\MarketplaceController;
use App\Http\Controllers\EarningsController;
use App\Http\Controllers\HealthIncidentController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| API Routes — WasteLink PH
|--------------------------------------------------------------------------
| Rate-limited to 100 requests/min per user
*/

// ─── Public Auth ───
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// ─── Protected Routes ───
Route::middleware(['auth:api', 'throttle:100,1'])->group(function () {

    // User
    Route::get('/users/me', [UserController::class, 'me']);
    Route::patch('/users/me', [UserController::class, 'update']);

    // Collections
    Route::get('/collections', [CollectionController::class, 'index']);
    Route::post('/collections', [CollectionController::class, 'store']);
    Route::post('/collections/sync', [CollectionController::class, 'bulkSync']);
    Route::get('/collections/{id}', [CollectionController::class, 'show']);
    Route::delete('/collections/{id}', [CollectionController::class, 'destroy']);

    // Marketplace
    Route::get('/marketplace/listings', [MarketplaceController::class, 'listings']);
    Route::post('/marketplace/listings', [MarketplaceController::class, 'createListing']);
    Route::get('/marketplace/listings/{id}/bids', [MarketplaceController::class, 'bids']);
    Route::post('/marketplace/listings/{id}/bids', [MarketplaceController::class, 'placeBid']);
    Route::patch('/marketplace/bids/{id}/accept', [MarketplaceController::class, 'acceptBid']);
    Route::patch('/marketplace/bids/{id}/reject', [MarketplaceController::class, 'rejectBid']);

    // Earnings
    Route::get('/earnings', [EarningsController::class, 'summary']);
    Route::post('/earnings/payout', [EarningsController::class, 'requestPayout']);
    Route::get('/earnings/history', [EarningsController::class, 'history']);

    // Health & Safety
    Route::get('/health-incidents', [HealthIncidentController::class, 'index']);
    Route::post('/health-incidents', [HealthIncidentController::class, 'store']);
    Route::post('/health-incidents/{id}/alert', [HealthIncidentController::class, 'alert']);

    // Admin (barangay/co-op managers)
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/analytics', [AdminController::class, 'analytics']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::patch('/users/{id}/verify', [AdminController::class, 'verifyUser']);
        Route::get('/compliance', [AdminController::class, 'complianceReport']);
        Route::get('/heatmap', [AdminController::class, 'collectionHeatmap']);
    });
});
