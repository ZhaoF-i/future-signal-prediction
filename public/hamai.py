"""Error-normalized Hop-Adaptive Mirror Artifact Index (NumPy).

Inputs must be aligned, finite, one-dimensional real waveforms.
Energy units are sums of squares, not mean squares. No automatic alignment,
truncation, resampling, clipping, or DC removal is performed.
"""
import numpy as np


def hamai_error(target, estimate, period, ridge=1e-6, eps=1e-12):
    """Fit all non-DC period-P templates and return the exact dB ratio.

    `hamai_error_db` always follows 10*log10((Em+eps)/(Ee+eps)).
    Interpret it only when status == 'ok'. The 100*eps low-error rule
    is an explicit reporting convention, not part of the metric definition.
    Do not silently include invalid samples in an aggregate.
    """
    if isinstance(period, (bool, np.bool_)) or not isinstance(period, (int, np.integer)) or period < 2:
        raise ValueError('period must be an integer >= 2')
    if not np.isfinite(ridge) or ridge <= 0:
        raise ValueError('ridge must be finite and positive')
    if not np.isfinite(eps) or eps <= 0:
        raise ValueError('eps must be finite and positive')
    if np.iscomplexobj(target) or np.iscomplexobj(estimate):
        raise ValueError('waveforms must be real')
    y, y_hat = np.asarray(target, dtype=np.float64), np.asarray(estimate, dtype=np.float64)
    if y.ndim != 1 or y_hat.shape != y.shape or len(y) < period:
        raise ValueError('aligned 1-D waveforms of equal length >= period are required')
    if not np.isfinite(y).all() or not np.isfinite(y_hat).all():
        raise ValueError('waveforms must contain only finite values')
    e = y_hat - y
    phase = np.arange(period, dtype=np.float64)
    columns = []
    for m in range(1, period // 2 + 1):
        angle = 2 * np.pi * m * phase / period
        columns.append(np.cos(angle))
        if 2 * m != period:
            columns.append(np.sin(angle))
    B = np.column_stack(columns)
    syy = np.array([y[r::period] @ y[r::period] for r in range(period)])
    sye = np.array([y[r::period] @ e[r::period] for r in range(period)])
    G = B.T @ (syy[:, None] * B)
    h = B.T @ sye
    alpha = ridge * max(float(np.trace(G)) / (period - 1), eps)
    c = np.linalg.solve(G + alpha * np.eye(period - 1), h)
    Em = max(float(c @ G @ c), 0.0)
    Ee, Et = float(e @ e), float(y @ y)
    if not np.isfinite([Em, Ee, Et]).all():
        raise ValueError('energy overflow; rescale the waveforms and document the scale')
    if Et <= eps:
        status = 'silent_target'
    elif Ee == 0:
        status = 'no_error'
    elif Ee <= 100 * eps:
        status = 'low_error'
    else:
        status = 'ok'
    # Difference of logs avoids an intermediate ratio underflow.
    db = 10.0 * (np.log10(Em + eps) - np.log10(Ee + eps))
    return dict(hamai_error_db=float(db), mirror_energy=Em, error_energy=Ee,
                target_energy=Et, mirror_fraction=Em / (Ee + eps),
                status=status, valid=(status == 'ok'), period=int(period),
                basis_count=period - 1, ridge=ridge, eps=eps)
