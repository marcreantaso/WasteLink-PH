<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HealthIncident extends Model
{
    protected $fillable = [
        'user_id', 'type', 'severity', 'description',
        'gps_lat', 'gps_lng', 'alerted',
    ];

    protected $casts = [
        'alerted' => 'boolean',
        'gps_lat' => 'decimal:6',
        'gps_lng' => 'decimal:6',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
