<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Collection extends Model
{
    protected $fillable = [
        'user_id', 'material_type', 'weight_kg', 'photo', 'gps_lat', 'gps_lng',
        'notes', 'confidence', 'local_id', 'synced_at', 'source',
    ];

    protected $casts = [
        'weight_kg' => 'decimal:2',
        'gps_lat' => 'decimal:6',
        'gps_lng' => 'decimal:6',
        'confidence' => 'decimal:1',
        'synced_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
