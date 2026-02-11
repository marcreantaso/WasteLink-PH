<?php

namespace App\Http\Controllers;

use App\Models\MarketplaceListing;
use App\Models\Bid;
use App\Models\Earning;
use Illuminate\Http\Request;

class MarketplaceController extends Controller
{
    /**
     * List marketplace listings with optional material/location filter
     */
    public function listings(Request $request)
    {
        $query = MarketplaceListing::with('user')
            ->where('status', 'active');

        if ($request->has('material')) {
            $query->where('material_type', $request->material);
        }
        if ($request->has('location')) {
            $query->whereHas('user', fn($q) => $q->where('barangay', $request->location));
        }

        $listings = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($listings);
    }

    /**
     * Create a new marketplace listing
     */
    public function createListing(Request $request)
    {
        $validated = $request->validate([
            'material_type' => 'required|in:PET,HDPE,METAL,PAPER,ORGANIC,OTHER',
            'quantity_kg' => 'required|numeric|min:0.1',
            'price_per_kg' => 'required|numeric|min:0.01',
            'description' => 'nullable|string|max:500',
        ]);

        $listing = $request->user()->marketplaceListings()->create([
            ...$validated,
            'status' => 'active',
        ]);

        return response()->json([
            'message' => 'Listing created',
            'listing' => $listing,
        ], 201);
    }

    /**
     * Get bids for a listing
     */
    public function bids($id)
    {
        $listing = MarketplaceListing::findOrFail($id);
        $bids = $listing->bids()->with('buyer')->orderBy('price', 'desc')->get();
        return response()->json($bids);
    }

    /**
     * Place a bid on a listing
     */
    public function placeBid(Request $request, $id)
    {
        $listing = MarketplaceListing::where('status', 'active')->findOrFail($id);

        $validated = $request->validate([
            'price' => 'required|numeric|min:0.01',
        ]);

        $bid = $listing->bids()->create([
            'buyer_id' => $request->user()->id,
            'price' => $validated['price'],
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Bid placed',
            'bid' => $bid,
        ], 201);
    }

    /**
     * Accept a bid (one-tap)
     */
    public function acceptBid(Request $request, $id)
    {
        $bid = Bid::with('listing')->findOrFail($id);

        // Verify the listing belongs to the authenticated user
        if ($bid->listing->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $bid->update(['status' => 'accepted']);
        $bid->listing->update(['status' => 'sold']);

        // Reject all other bids
        Bid::where('listing_id', $bid->listing_id)
            ->where('id', '!=', $bid->id)
            ->update(['status' => 'rejected']);

        // Create earnings record
        $totalAmount = $bid->listing->quantity_kg * $bid->price;
        $commission = $totalAmount * 0.05; // 5% commission

        Earning::create([
            'user_id' => $request->user()->id,
            'amount' => $totalAmount - $commission,
            'type' => 'sale',
            'reference_id' => $bid->listing->id,
            'description' => "Sale of {$bid->listing->material_type} ({$bid->listing->quantity_kg}kg)",
        ]);

        Earning::create([
            'user_id' => $request->user()->id,
            'amount' => -$commission,
            'type' => 'commission',
            'reference_id' => $bid->listing->id,
            'description' => '5% platform commission',
        ]);

        // Update wallet balance
        $request->user()->increment('wallet_balance', $totalAmount - $commission);

        return response()->json([
            'message' => 'Bid accepted',
            'earning' => $totalAmount - $commission,
        ]);
    }

    /**
     * Reject a bid
     */
    public function rejectBid(Request $request, $id)
    {
        $bid = Bid::with('listing')->findOrFail($id);

        if ($bid->listing->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $bid->update(['status' => 'rejected']);

        return response()->json(['message' => 'Bid rejected']);
    }
}
