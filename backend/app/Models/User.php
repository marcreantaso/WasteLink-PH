<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use Notifiable;

    protected $fillable = [
        'name', 'phone', 'barangay', 'pin_hash', 'photo_id',
        'role', 'wallet_balance', 'is_verified', 'verified_at',
    ];

    protected $hidden = ['pin_hash'];

    protected $casts = [
        'wallet_balance' => 'decimal:2',
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
    ];

    // JWT
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }
    public function getJWTCustomClaims()
    {
        return ['role' => $this->role];
    }

    // Relationships
    public function collections()
    {
        return $this->hasMany(Collection::class);
    }
    public function marketplaceListings()
    {
        return $this->hasMany(MarketplaceListing::class);
    }
    public function bids()
    {
        return $this->hasMany(Bid::class , 'buyer_id');
    }
    public function earnings()
    {
        return $this->hasMany(Earning::class);
    }
    public function healthIncidents()
    {
        return $this->hasMany(HealthIncident::class);
    }
}
