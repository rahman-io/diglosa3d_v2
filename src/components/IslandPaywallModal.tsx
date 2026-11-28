import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  CreditCard,
  ExternalLink,
  GraduationCap,
  Lock,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
} from 'lucide-react';
import { ZONE_INFO } from '../data/diglosaCatalog';
import { ZoneId } from '../types/game';
import { RpgBoardPanel, RpgPillButton } from './RpgUiKit';

export type PaymentGatewayId = 'midtrans' | 'xendit';

export type IslandPaywallReason = 'post_refugee' | 'locked_zone' | 'locked_bridge';

interface IslandPaywallModalProps {
  open: boolean;
  reason: IslandPaywallReason;
  targetZoneId?: ZoneId | null;
  playerName: string;
  onDecline: () => void;
  onUnlocked: () => void;
  onClose?: () => void;
}

interface CheckoutSessionInfo {
  gateway: PaymentGatewayId;
  orderId: string;
  checkoutUrl?: string;
  statusMessage: string;
}

const PAYMENT_API_URL = (import.meta.env.VITE_PAYMENT_API_URL || '').trim().replace(/\/+$/, '');

export const IslandPaywallModal: React.FC<IslandPaywallModalProps> = ({
  open,
  reason,
  targetZoneId,
  playerName,
  onDecline,
  onUnlocked,
  onClose,
}) => {
  const [gateway, setGateway] = useState<PaymentGatewayId>('midtrans');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [checkoutSession, setCheckoutSession] = useState<CheckoutSessionInfo | null>(null);

  const targetZoneName = useMemo(() => {
    if (targetZoneId && ZONE_INFO[targetZoneId]) {
      return ZONE_INFO[targetZoneId].name;
    }
    return 'Pulau Hutan Satwa & Pulau Lainnya';
  }, [targetZoneId]);

  if (!open) return null;

  const isPostRefugee = reason === 'post_refugee';

  const handleCreateCheckout = async () => {
    setErrorMsg(null);
    if (!PAYMENT_API_URL) {
      setErrorMsg(
        `Endpoint pembayaran ${
          gateway === 'midtrans' ? 'Midtrans' : 'Xendit'
        } (VITE_PAYMENT_API_URL) belum dihubungkan di konfigurasi server. Kamu dapat menekan "Tolak / Belum Beli" untuk kembali beraktivitas di Desa Sapaan dan belajar kosakata bersama Ibu Guru di Sekolah Desa.`,
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${PAYMENT_API_URL}/api/payments/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gateway,
          productId: 'diglosa_all_islands_pass',
          playerName,
          targetZoneId: targetZoneId || 'hutan_satwa',
          amountIdr: 49000,
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | {
            orderId?: string;
            checkoutUrl?: string;
            paid?: boolean;
            message?: string;
          }
        | null;

      if (!res.ok || !data) {
        throw new Error(data?.message || `Gagal membuat transaksi ${gateway.toUpperCase()} (${res.status}).`);
      }
      if (data.paid) {
        onUnlocked();
        return;
      }
      setCheckoutSession({
        gateway,
        orderId: data.orderId || `ORDER-${Date.now()}`,
        checkoutUrl: data.checkoutUrl,
        statusMessage:
          data.message ||
          `Invoice ${gateway === 'midtrans' ? 'Midtrans' : 'Xendit'} siap dibayar. Selesaikan pembayaran lalu klik "Cek Status Pembayaran".`,
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menghubungi layanan pembayaran.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!PAYMENT_API_URL || !checkoutSession) return;
    setVerifying(true);
    setErrorMsg(null);
    try {
      const res = await fetch(
        `${PAYMENT_API_URL}/api/payments/status?orderId=${encodeURIComponent(
          checkoutSession.orderId,
        )}&gateway=${encodeURIComponent(checkoutSession.gateway)}`,
      );
      const data = (await res.json().catch(() => null)) as {
        paid?: boolean;
        status?: string;
        message?: string;
      } | null;

      if (res.ok && data?.paid) {
        onUnlocked();
        return;
      }
      setErrorMsg(
        data?.message ||
          `Status pembayaran (${checkoutSession.orderId}): ${data?.status || 'Menunggu pembayaran'}.`,
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal memeriksa status pembayaran.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-sm sm:p-5">
      <div className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto overscroll-contain">
        <RpgBoardPanel className="relative p-4 text-slate-100 shadow-2xl sm:p-6">
          <div className="mb-3 flex items-start justify-between gap-3 border-b border-amber-300/25 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-amber-300/70 bg-amber-500/20 text-amber-300 shadow">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                  {isPostRefugee ? 'Batas Misi Pulau Desa Sapaan' : 'Wilayah Pulau Terkunci'}
                </div>
                <h2 className="text-base font-black text-amber-50 sm:text-xl">
                  Buka Akses {targetZoneName} & Kepulauan Berikutnya
                </h2>
              </div>
            </div>
            {onClose && !isPostRefugee && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-slate-900/80 text-slate-200 hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="space-y-3.5 text-xs leading-relaxed sm:text-sm">
            <div className="rounded-2xl border border-amber-300/40 bg-amber-950/35 p-3.5 text-amber-50">
              <p className="font-bold">
                {isPostRefugee ? (
                  <>
                    Bagus, <span className="text-amber-300">{playerName || 'Petualang'}</span>! Dua warga pengungsi
                    telah menunjukkan arah ke misi pulau berikutnya. Untuk menyeberang dan membuka misi{' '}
                    <span className="font-black text-emerald-300">Pulau Hutan Satwa</span> serta seluruh pulau &
                    lautan lainnya, diperlukan pembelian tiket akses kepulauan berbayar.
                  </>
                ) : (
                  <>
                    Akses menuju <span className="font-black text-amber-300">{targetZoneName}</span> dan wilayah pulau/laut
                    di luar <span className="font-black text-emerald-300">Pulau Desa Sapaan</span> (beserta laut
                    pesisir monster laut Desa Sapaan) masih terkunci sebelum pembelian misi lanjutan.
                  </>
                )}
              </p>
              <p className="mt-2 text-[11px] text-amber-200/90 sm:text-xs">
                Jika belum ingin membeli sekarang, kamu tetap dapat melanjutkan kehidupan bersama warga Desa Sapaan,
                melawan monster laut di pesisir Desa Sapaan, serta belajar ulang kosakata Desa Sapaan bersama{' '}
                <span className="font-black text-sky-200">Ibu Guru di Sekolah Desa Sapaan</span>.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setGateway('midtrans');
                  setErrorMsg(null);
                }}
                className={`flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition ${
                  gateway === 'midtrans'
                    ? 'border-sky-300 bg-sky-950/60 shadow-[0_0_0_2px_rgba(56,189,248,0.28)]'
                    : 'border-white/15 bg-slate-900/65 hover:border-white/30'
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 text-sky-300">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-sm font-black text-white">
                    <span>Midtrans</span>
                    {gateway === 'midtrans' && <CheckCircle2 className="h-4 w-4 text-sky-300" />}
                  </div>
                  <div className="text-[11px] text-slate-300">QRIS, GoPay, ShopeePay, Virtual Account</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setGateway('xendit');
                  setErrorMsg(null);
                }}
                className={`flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition ${
                  gateway === 'xendit'
                    ? 'border-emerald-300 bg-emerald-950/60 shadow-[0_0_0_2px_rgba(52,211,153,0.28)]'
                    : 'border-white/15 bg-slate-900/65 hover:border-white/30'
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                  <Wallet className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-sm font-black text-white">
                    <span>Xendit</span>
                    {gateway === 'xendit' && <CheckCircle2 className="h-4 w-4 text-emerald-300" />}
                  </div>
                  <div className="text-[11px] text-slate-300">Virtual Account Bank, OVO, DANA, QRIS</div>
                </div>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/15 bg-slate-900/80 px-3.5 py-2.5">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Paket Buka Semua Pulau & Misi Lanjutan
                </div>
                <div className="flex items-center gap-2 text-sm font-black text-amber-200">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <span>Pasar Rasa · Hutan Satwa · Gerbang Kota · Menara Waktu · Gua Portal</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono-nums text-base font-black text-emerald-300">Rp 49.000</div>
                <div className="text-[10px] font-semibold text-slate-400">Sekali bayar permanen</div>
              </div>
            </div>

            {checkoutSession && (
              <div className="space-y-2 rounded-2xl border border-sky-400/50 bg-sky-950/45 p-3 text-xs text-sky-100">
                <div className="flex items-center gap-2 font-black text-sky-200">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>
                    Invoice {checkoutSession.gateway.toUpperCase()} · {checkoutSession.orderId}
                  </span>
                </div>
                <p>{checkoutSession.statusMessage}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {checkoutSession.checkoutUrl && (
                    <a
                      href={checkoutSession.checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-sky-300/60 bg-sky-600 px-3 py-1.5 text-xs font-black text-white hover:bg-sky-500"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Buka Halaman Pembayaran</span>
                    </a>
                  )}
                  <RpgPillButton
                    variant="green"
                    size="sm"
                    disabled={verifying}
                    onClick={() => void handleVerifyPayment()}
                  >
                    <span>{verifying ? 'Memeriksa...' : 'Cek Status Pembayaran'}</span>
                  </RpgPillButton>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="rounded-2xl border border-rose-400/50 bg-rose-950/60 p-3 text-xs font-semibold text-rose-100">
                {errorMsg}
              </div>
            )}

            <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
              <RpgPillButton
                variant="cream"
                size="md"
                onClick={isPostRefugee ? onDecline : onClose ?? onDecline}
                className="w-full sm:w-auto"
              >
                {isPostRefugee ? (
                  <>
                    <GraduationCap className="h-4 w-4 shrink-0 text-emerald-700" />
                    <span>Tolak / Belum Beli — Tetap di Desa</span>
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 shrink-0 text-slate-700" />
                    <span>Tutup — Tetap di Posisi</span>
                  </>
                )}
              </RpgPillButton>

              <RpgPillButton
                variant="gold"
                size="md"
                disabled={loading}
                onClick={() => void handleCreateCheckout()}
                className="w-full sm:w-auto"
              >
                <CreditCard className="h-4 w-4 shrink-0" />
                <span>
                  {loading
                    ? 'Memproses Invoice...'
                    : `Beli Akses via ${gateway === 'midtrans' ? 'Midtrans' : 'Xendit'}`}
                </span>
              </RpgPillButton>
            </div>
          </div>
        </RpgBoardPanel>
      </div>
    </div>
  );
};
