<?php

namespace App\Http\Controllers;

use App\Models\Earning;
use Illuminate\Http\Request;

class EarningsController extends Controller
{
    /**
     * Get earnings summary (daily/weekly)
     */
    public function summary(Request $request)
    {
        $user = $request->user();
        $period = $request->get('period', 'daily');

        $todayEarnings = $user->earnings()
            ->where('type', 'sale')
            ->whereDate('created_at', today())
            ->sum('amount');

        $weeklyEarnings = $user->earnings()
            ->where('type', 'sale')
            ->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])
            ->sum('amount');

        $monthlyEarnings = $user->earnings()
            ->where('type', 'sale')
            ->whereMonth('created_at', now()->month)
            ->sum('amount');

        $totalCommissions = abs($user->earnings()
            ->where('type', 'commission')
            ->sum('amount'));

        return response()->json([
            'balance' => $user->wallet_balance,
            'today_earnings' => $todayEarnings,
            'weekly_earnings' => $weeklyEarnings,
            'monthly_earnings' => $monthlyEarnings,
            'total_commissions' => $totalCommissions,
        ]);
    }

    /**
     * Request a payout (GCash/Maya)
     */
    public function requestPayout(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:50', // Minimum 50 PHP
            'method' => 'required|in:gcash,maya',
            'account' => 'required|string',
        ]);

        $user = $request->user();

        if ($user->wallet_balance < $validated['amount']) {
            return response()->json(['error' => 'Insufficient balance'], 400);
        }

        // Create payout record
        $earning = Earning::create([
            'user_id' => $user->id,
            'amount' => -$validated['amount'],
            'type' => 'payout',
            'description' => "Payout via {$validated['method']} to {$validated['account']}",
            'status' => 'pending',
        ]);

        // Deduct from wallet
        $user->decrement('wallet_balance', $validated['amount']);

        // TODO: Dispatch job to process payout via GCash/Maya API
        // ProcessPayout::dispatch($earning);

        return response()->json([
            'message' => 'Payout request submitted',
            'earning' => $earning,
            'new_balance' => $user->fresh()->wallet_balance,
        ]);
    }

    /**
     * Get earnings history
     */
    public function history(Request $request)
    {
        $earnings = $request->user()
            ->earnings()
            ->orderBy('created_at', 'desc')
            ->paginate(30);

        return response()->json($earnings);
    }
}
