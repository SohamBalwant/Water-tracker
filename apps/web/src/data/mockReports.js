import { ShortageReportStatus } from '../../../../shared/types.js';

export const mockReports = [
  {
    reportId: 'report-001',
    reporterId: 'resident-demo-2',
    locality: 'Cidco Sector N-4',
    latitude: 19.8745,
    longitude: 75.3412,
    description: 'Municipal pipeline pressure dropped to zero for 3 consecutive days.',
    reportedAt: '2026-10-10T09:00:00.000Z',
    verificationStatus: ShortageReportStatus.UNVERIFIED,
  },
  {
    reportId: 'report-002',
    reporterId: 'resident-demo-3',
    locality: 'Waluj MIDC Sector B',
    latitude: 19.8450,
    longitude: 75.2500,
    description: 'Society storage depleted. Ground water salinity too high for utility.',
    reportedAt: '2026-10-10T11:30:00.000Z',
    verificationStatus: ShortageReportStatus.UNDER_REVIEW,
  },
  {
    reportId: 'report-003',
    reporterId: 'resident-demo-4',
    locality: 'Samarth Nagar West',
    latitude: 19.8810,
    longitude: 75.3280,
    description: 'Water rationing in effect. Expected next supply in 48 hours.',
    reportedAt: '2026-10-11T06:15:00.000Z',
    verificationStatus: ShortageReportStatus.VERIFIED,
  },
];
