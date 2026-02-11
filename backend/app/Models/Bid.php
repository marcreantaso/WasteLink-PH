<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bid extends Model
{
    protected $fillable = ['listing_id', 'buyer_id', 'price', 'status'];

    protected $casts = ['price' => 'decimal:2'];

    public function listing()
    {
        return $this->belongsTo(MarketplaceListing::class , 'listing_id');
    }
    public function buyer()
    {
        return $this->belongsTo(User::class , 'buyer_id');
    }
}
