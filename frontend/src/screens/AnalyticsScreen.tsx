import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderNav from '../components/HeaderNav';
import FloatingChat from '../components/FloatingChat';

const AnalyticsScreen: React.FC = () => {
    const navigate = useNavigate();

    const scanParts = [
        { label: 'Leaves', value: 420, color: '#1f6a45' },
        { label: 'Pods', value: 310, color: '#2e7d5b' },
        { label: 'Seeds', value: 180, color: '#3b8d68' },
        { label: 'Flowers', value: 140, color: '#5aa37d' },
        { label: 'Bark', value: 90, color: '#7ab898' }
    ];
    const maxScan = Math.max(...scanParts.map(item => item.value));

    const detection = {
        healthy: 680,
        disease: 220
    };
    const detectionTotal = detection.healthy + detection.disease;
    const healthyPct = Math.round((detection.healthy / detectionTotal) * 100);
    const diseasePct = 100 - healthyPct;

    const accuracyTrend = [84, 86, 88, 89, 90, 91, 92];
    const accuracyPoints = accuracyTrend
        .map((value, index) => {
            const x = (index / (accuracyTrend.length - 1)) * 240 + 10;
            const y = 80 - (value - 80) * 4;
            return `${x},${y}`;
        })
        .join(' ');

    const marketValueTrend = [120, 135, 150, 165, 180, 210];
    const marketMax = Math.max(...marketValueTrend);

    return (
        <div className="screen" style={{ background: 'linear-gradient(180deg, #f3fbf6 0%, #ffffff 50%, #f8fcf9 100%)' }}>
            <div className="header">
                <button className="back-btn" onClick={() => navigate(-1)}>←</button>
                <div className="header-title">Admin Analytics</div>
                <div style={{ width: '52px' }}></div>
            </div>

            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '72px 32px 120px',
                minHeight: 'calc(100vh - 200px)',
                fontFamily: "'Sora', 'Space Grotesk', sans-serif",
                color: '#0f2419'
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    marginBottom: '28px'
                }}>
                    <h2 style={{ margin: 0, fontSize: '36px', letterSpacing: '-0.4px' }}>
                        Analytics & Insights
                    </h2>
                    <p style={{ margin: 0, color: '#50645a', fontSize: '16px' }}>
                        Static UI preview of admin analytics. Data wiring comes next.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '16px',
                    marginBottom: '28px'
                }}>
                    {[
                        { label: 'Total Scans', value: '900' },
                        { label: 'Healthy Detected', value: '680' },
                        { label: 'Disease Detected', value: '220' },
                        { label: 'Scan Accuracy', value: '92%' },
                        { label: 'Market Value', value: 'PHP 210k' }
                    ].map(item => (
                        <div
                            key={item.label}
                            style={{
                                background: 'white',
                                borderRadius: '16px',
                                padding: '18px',
                                border: '1px solid rgba(15,36,25,0.08)',
                                boxShadow: '0 10px 22px rgba(15, 36, 25, 0.08)'
                            }}
                        >
                            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#6b7f74' }}>
                                {item.label}
                            </div>
                            <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '6px' }}>{item.value}</div>
                        </div>
                    ))}
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '18px'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '18px',
                        padding: '22px',
                        border: '1px solid rgba(15,36,25,0.08)',
                        boxShadow: '0 12px 26px rgba(15, 36, 25, 0.1)'
                    }}>
                        <h3 style={{ marginTop: 0 }}>Total scans by malunggay part</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                            {scanParts.map(item => (
                                <div key={item.label} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 48px', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ fontSize: '13px', color: '#567064' }}>{item.label}</div>
                                    <div style={{
                                        height: '12px',
                                        background: '#eef4f0',
                                        borderRadius: '999px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${Math.round((item.value / maxScan) * 100)}%`,
                                            height: '100%',
                                            background: item.color,
                                            borderRadius: '999px'
                                        }} />
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#5b7267', textAlign: 'right' }}>{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{
                        background: 'white',
                        borderRadius: '18px',
                        padding: '22px',
                        border: '1px solid rgba(15,36,25,0.08)',
                        boxShadow: '0 12px 26px rgba(15, 36, 25, 0.1)'
                    }}>
                        <h3 style={{ marginTop: 0 }}>Healthy vs disease detected</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginTop: '14px' }}>
                            <div style={{
                                width: '140px',
                                height: '140px',
                                borderRadius: '50%',
                                background: `conic-gradient(#2e7d5b 0% ${healthyPct}%, #e06b6b ${healthyPct}% 100%)`,
                                display: 'grid',
                                placeItems: 'center',
                                boxShadow: 'inset 0 0 0 14px #f9fbfa'
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '22px', fontWeight: 700 }}>{healthyPct}%</div>
                                    <div style={{ fontSize: '12px', color: '#6b7f74' }}>Healthy</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2e7d5b' }} />
                                    <span>Healthy: {detection.healthy}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#e06b6b' }} />
                                    <span>Disease: {detection.disease}</span>
                                </div>
                                <div style={{ fontSize: '12px', color: '#6b7f74' }}>Total scans: {detectionTotal}</div>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        background: 'white',
                        borderRadius: '18px',
                        padding: '22px',
                        border: '1px solid rgba(15,36,25,0.08)',
                        boxShadow: '0 12px 26px rgba(15, 36, 25, 0.1)'
                    }}>
                        <h3 style={{ marginTop: 0 }}>Accuracy of scan results</h3>
                        <svg width="260" height="110" style={{ marginTop: '10px' }}>
                            <polyline
                                fill="none"
                                stroke="#1f6a45"
                                strokeWidth="3"
                                points={accuracyPoints}
                            />
                            <polyline
                                fill="rgba(46,125,91,0.15)"
                                stroke="none"
                                points={`${accuracyPoints} 250,90 10,90`}
                            />
                        </svg>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7f74' }}>
                            <span>Week 1</span>
                            <span>Week 7</span>
                        </div>
                    </div>

                    <div style={{
                        background: 'white',
                        borderRadius: '18px',
                        padding: '22px',
                        border: '1px solid rgba(15,36,25,0.08)',
                        boxShadow: '0 12px 26px rgba(15, 36, 25, 0.1)'
                    }}>
                        <h3 style={{ marginTop: 0 }}>Market value (monthly)</h3>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '120px', marginTop: '10px' }}>
                            {marketValueTrend.map((value, index) => (
                                <div key={`${value}-${index}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                    <div
                                        style={{
                                            width: '100%',
                                            height: `${Math.round((value / marketMax) * 100)}%`,
                                            background: 'linear-gradient(180deg, #2d7a50 0%, #8ec8a7 100%)',
                                            borderRadius: '10px'
                                        }}
                                    />
                                    <div style={{ fontSize: '11px', color: '#6b7f74' }}>{index + 1}m</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <HeaderNav />
            <FloatingChat />
        </div>
    );
};

export default AnalyticsScreen;