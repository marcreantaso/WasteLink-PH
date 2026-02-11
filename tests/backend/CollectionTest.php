<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Collection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class CollectionTest extends TestCase
{
    use RefreshDatabase;

    private $user;
    private $token;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::create([
            'name' => 'Test Worker',
            'phone' => '+639123456789',
            'barangay' => 'Balibago',
            'pin_hash' => Hash::make('1234'),
            'role' => 'worker',
        ]);

        $this->token = JWTAuth::fromUser($this->user);
    }

    public function test_can_create_collection()
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson('/api/collections', [
            'material_type' => 'PET',
            'weight_kg' => 5.5,
            'gps_lat' => 14.31,
            'gps_lng' => 121.11,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['message', 'collection']);

        $this->assertDatabaseHas('collections', [
            'user_id' => $this->user->id,
            'material_type' => 'PET',
            'weight_kg' => 5.5,
        ]);
    }

    public function test_can_list_collections()
    {
        Collection::create([
            'user_id' => $this->user->id,
            'material_type' => 'METAL',
            'weight_kg' => 3.0,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson('/api/collections');

        $response->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_can_bulk_sync_collections()
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson('/api/collections/sync', [
            'items' => [
                ['material_type' => 'PET', 'weight_kg' => 2.0, 'timestamp' => now()->toISOString(), 'local_id' => 'local_1'],
                ['material_type' => 'PAPER', 'weight_kg' => 5.0, 'timestamp' => now()->toISOString(), 'local_id' => 'local_2'],
            ],
        ]);

        $response->assertStatus(200)
            ->assertJson(['synced_count' => 2, 'error_count' => 0]);
    }

    public function test_bulk_sync_is_idempotent()
    {
        $payload = [
            'items' => [
                ['material_type' => 'PET', 'weight_kg' => 2.0, 'timestamp' => now()->toISOString(), 'local_id' => 'local_1'],
            ],
        ];

        // Sync twice
        $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson('/api/collections/sync', $payload);

        $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson('/api/collections/sync', $payload);

        // Should only have 1 record
        $this->assertEquals(1, Collection::where('local_id', 'local_1')->count());
    }

    public function test_rejects_invalid_material_type()
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson('/api/collections', [
            'material_type' => 'INVALID',
            'weight_kg' => 5.0,
        ]);

        $response->assertStatus(422);
    }
}
