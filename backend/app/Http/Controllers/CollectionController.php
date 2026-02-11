<?php

namespace App\Http\Controllers;

use App\Models\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CollectionController extends Controller
{
    /**
     * List user's collections
     */
    public function index(Request $request)
    {
        $collections = $request->user()
            ->collections()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($collections);
    }

    /**
     * Store a new collection log
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'material_type' => 'required|in:PET,HDPE,METAL,PAPER,ORGANIC,OTHER',
            'weight_kg' => 'required|numeric|min:0.01|max:1000',
            'photo' => 'nullable|string',
            'gps_lat' => 'nullable|numeric',
            'gps_lng' => 'nullable|numeric',
            'notes' => 'nullable|string|max:500',
            'confidence' => 'nullable|numeric|min:0|max:100',
        ]);

        $collection = $request->user()->collections()->create([
            ...$validated,
            'synced_at' => now(),
        ]);

        return response()->json([
            'message' => 'Collection logged',
            'collection' => $collection,
        ], 201);
    }

    /**
     * Bulk sync offline collections (delta sync)
     * Conflict resolution: last-write-wins
     */
    public function bulkSync(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'items' => 'required|array|max:100',
            'items.*.material_type' => 'required|in:PET,HDPE,METAL,PAPER,ORGANIC,OTHER',
            'items.*.weight_kg' => 'required|numeric|min:0.01',
            'items.*.timestamp' => 'required|date',
            'items.*.local_id' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $synced = [];
        $errors = [];

        foreach ($request->items as $item) {
            try {
                // Check for existing by local_id (idempotent)
                $existing = Collection::where('local_id', $item['local_id'])
                    ->where('user_id', $request->user()->id)
                    ->first();

                if ($existing) {
                    // Last-write-wins: update if newer
                    if (strtotime($item['timestamp']) > strtotime($existing->created_at)) {
                        $existing->update([
                            'material_type' => $item['material_type'],
                            'weight_kg' => $item['weight_kg'],
                            'synced_at' => now(),
                        ]);
                    }
                    $synced[] = $existing->id;
                }
                else {
                    $collection = $request->user()->collections()->create([
                        'material_type' => $item['material_type'],
                        'weight_kg' => $item['weight_kg'],
                        'gps_lat' => $item['gps_lat'] ?? null,
                        'gps_lng' => $item['gps_lng'] ?? null,
                        'local_id' => $item['local_id'],
                        'synced_at' => now(),
                    ]);
                    $synced[] = $collection->id;
                }
            }
            catch (\Exception $e) {
                $errors[] = ['local_id' => $item['local_id'], 'error' => $e->getMessage()];
            }
        }

        return response()->json([
            'synced_count' => count($synced),
            'error_count' => count($errors),
            'synced_ids' => $synced,
            'errors' => $errors,
        ]);
    }

    /**
     * Show single collection
     */
    public function show(Request $request, $id)
    {
        $collection = $request->user()->collections()->findOrFail($id);
        return response()->json($collection);
    }

    /**
     * Delete collection
     */
    public function destroy(Request $request, $id)
    {
        $collection = $request->user()->collections()->findOrFail($id);
        $collection->delete();
        return response()->json(['message' => 'Collection deleted']);
    }
}
