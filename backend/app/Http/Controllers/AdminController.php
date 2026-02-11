<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Dashboard analytics
     */
    public function analytics(Request $request)
    {
        $period = $request->get('period', 'week');

        // Total collections by material
        $byMaterial = Collection::select('material_type', DB::raw('SUM(weight_kg) as total_weight'), DB::raw('COUNT(*) as count'))
            ->groupBy('material_type')
            ->get();

        // Collections over time
        $daily = Collection::select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(weight_kg) as total'))
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Top collectors
        $topCollectors = User::withSum('collections', 'weight_kg')
            ->where('role', 'worker')
            ->orderByDesc('collections_sum_weight_kg')
            ->limit(10)
            ->get(['id', 'name', 'barangay']);

        // By barangay
        $byBarangay = User::select('barangay', DB::raw('COUNT(*) as workers'))
            ->where('role', 'worker')
            ->groupBy('barangay')
            ->get();

        return response()->json([
            'by_material' => $byMaterial,
            'daily_trend' => $daily,
            'top_collectors' => $topCollectors,
            'by_barangay' => $byBarangay,
            'total_workers' => User::where('role', 'worker')->count(),
            'total_weight' => Collection::sum('weight_kg'),
        ]);
    }

    /**
     * User management list
     */
    public function users(Request $request)
    {
        $query = User::withCount('collections')
            ->withSum('collections', 'weight_kg');

        if ($request->has('barangay')) {
            $query->where('barangay', $request->barangay);
        }
        if ($request->has('verified')) {
            $query->where('is_verified', $request->boolean('verified'));
        }

        return response()->json(
            $query->orderBy('created_at', 'desc')->paginate(20)
        );
    }

    /**
     * Verify a user
     */
    public function verifyUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $user->update(['is_verified' => true, 'verified_at' => now()]);

        return response()->json([
            'message' => 'User verified',
            'user' => $user,
        ]);
    }

    /**
     * RA 9003 Compliance report
     */
    public function complianceReport(Request $request)
    {
        $startDate = $request->get('start', now()->startOfMonth()->toDateString());
        $endDate = $request->get('end', now()->toDateString());

        $data = Collection::select(
            'material_type',
            DB::raw('SUM(weight_kg) as total_weight'),
            DB::raw('COUNT(DISTINCT user_id) as workers_involved'),
            DB::raw('COUNT(*) as collection_count')
        )
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('material_type')
            ->get();

        return response()->json([
            'period' => ['start' => $startDate, 'end' => $endDate],
            'report' => $data,
            'total_diverted' => $data->sum('total_weight'),
            'compliance' => 'RA 9003 Ecological Solid Waste Management Act',
        ]);
    }

    /**
     * Collection heatmap data
     */
    public function collectionHeatmap(Request $request)
    {
        $points = Collection::select('gps_lat', 'gps_lng', DB::raw('SUM(weight_kg) as intensity'))
            ->whereNotNull('gps_lat')
            ->whereNotNull('gps_lng')
            ->groupBy('gps_lat', 'gps_lng')
            ->get();

        return response()->json($points);
    }
}
