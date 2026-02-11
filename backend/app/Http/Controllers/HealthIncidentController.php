<?php

namespace App\Http\Controllers;

use App\Models\HealthIncident;
use App\Services\SmsService;
use Illuminate\Http\Request;

class HealthIncidentController extends Controller
{
    /**
     * List user's health incidents
     */
    public function index(Request $request)
    {
        $incidents = $request->user()
            ->healthIncidents()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($incidents);
    }

    /**
     * Log a new health incident
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:cuts,fumes,heat,chemical',
            'severity' => 'required|in:low,medium,high,critical',
            'description' => 'nullable|string|max:1000',
            'gps_lat' => 'nullable|numeric',
            'gps_lng' => 'nullable|numeric',
        ]);

        $incident = $request->user()->healthIncidents()->create([
            ...$validated,
            'alerted' => $validated['severity'] === 'critical',
        ]);

        // Auto-alert for critical incidents
        if ($validated['severity'] === 'critical') {
            $this->sendEmergencyAlert($request->user(), $incident);
        }

        return response()->json([
            'message' => 'Incident logged',
            'incident' => $incident,
        ], 201);
    }

    /**
     * Manually trigger emergency alert for an incident
     */
    public function alert(Request $request, $id)
    {
        $incident = $request->user()->healthIncidents()->findOrFail($id);

        $this->sendEmergencyAlert($request->user(), $incident);

        $incident->update(['alerted' => true]);

        return response()->json(['message' => 'Emergency alert sent']);
    }

    /**
     * Send SMS alert to nearest clinic and barangay
     */
    private function sendEmergencyAlert($user, $incident)
    {
        $smsService = app(SmsService::class);

        $message = "[WasteLink EMERGENCY] Worker {$user->name} in Brgy. {$user->barangay} " .
            "reported: {$incident->type} (Severity: {$incident->severity}). " .
            "Please dispatch immediate assistance.";

        // Alert barangay hall
        $smsService->send(
            config('wastelink.emergency_contacts.barangay'),
            $message
        );

        // Alert nearest clinic
        $smsService->send(
            config('wastelink.emergency_contacts.clinic'),
            $message
        );
    }
}
