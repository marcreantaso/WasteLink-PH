<?php

namespace App\Services;

/**
 * SMS Service — Twilio integration for emergency alerts and notifications
 * This is a stub that logs messages when Twilio credentials are not configured.
 */
class SmsService
{
    private $client;
    private $from;
    private $enabled;

    public function __construct()
    {
        $sid = config('services.twilio.sid', env('TWILIO_SID'));
        $token = config('services.twilio.token', env('TWILIO_TOKEN'));
        $this->from = config('services.twilio.from', env('TWILIO_FROM'));
        $this->enabled = $sid && $token && $sid !== 'your-twilio-sid';

        if ($this->enabled) {
            try {
                $this->client = new \Twilio\Rest\Client($sid, $token);
            }
            catch (\Exception $e) {
                $this->enabled = false;
                \Log::warning('[SMS] Twilio client initialization failed: ' . $e->getMessage());
            }
        }
    }

    /**
     * Send an SMS message
     *
     * @param string $to   Phone number (e.g., +639123456789)
     * @param string $body Message body
     * @return bool
     */
    public function send(string $to, string $body): bool
    {
        if (!$this->enabled) {
            \Log::info("[SMS STUB] To: {$to} | Message: {$body}");
            return true;
        }

        try {
            $this->client->messages->create($to, [
                'from' => $this->from,
                'body' => $body,
            ]);
            \Log::info("[SMS] Sent to {$to}");
            return true;
        }
        catch (\Exception $e) {
            \Log::error("[SMS] Failed to send to {$to}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send emergency alert to multiple recipients
     */
    public function sendEmergencyBroadcast(array $recipients, string $body): array
    {
        $results = [];
        foreach ($recipients as $phone) {
            $results[$phone] = $this->send($phone, $body);
        }
        return $results;
    }
}
