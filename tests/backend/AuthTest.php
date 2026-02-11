<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register()
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test Worker',
            'phone' => '+639123456789',
            'barangay' => 'Balibago',
            'pin' => '1234',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['message', 'user', 'token'])
            ->assertJson(['message' => 'Registration successful']);

        $this->assertDatabaseHas('users', ['phone' => '+639123456789']);
    }

    public function test_user_can_login()
    {
        User::create([
            'name' => 'Test Worker',
            'phone' => '+639123456789',
            'barangay' => 'Balibago',
            'pin_hash' => Hash::make('1234'),
            'role' => 'worker',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'phone' => '+639123456789',
            'pin' => '1234',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['user', 'token']);
    }

    public function test_login_fails_with_wrong_pin()
    {
        User::create([
            'name' => 'Test Worker',
            'phone' => '+639123456789',
            'barangay' => 'Balibago',
            'pin_hash' => Hash::make('1234'),
            'role' => 'worker',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'phone' => '+639123456789',
            'pin' => '9999',
        ]);

        $response->assertStatus(401);
    }

    public function test_registration_requires_unique_phone()
    {
        User::create([
            'name' => 'Existing User',
            'phone' => '+639123456789',
            'barangay' => 'Balibago',
            'pin_hash' => Hash::make('1234'),
            'role' => 'worker',
        ]);

        $response = $this->postJson('/api/auth/register', [
            'name' => 'New User',
            'phone' => '+639123456789',
            'barangay' => 'Dita',
            'pin' => '5678',
        ]);

        $response->assertStatus(422);
    }
}
