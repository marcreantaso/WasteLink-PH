<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Get current authenticated user profile
     */
    public function me(Request $request)
    {
        $user = $request->user();
        $user->load('barangayInfo');

        return response()->json([
            'user' => $user,
        ]);
    }

    /**
     * Update user profile
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'photo_id' => 'sometimes|string',
            'barangay' => 'sometimes|string',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated',
            'user' => $user->fresh(),
        ]);
    }
}
