import { PageDetails as PageDetailsType, PerformanceMetrics } from '@/types/audit';

interface PageDetailsProps {
  details: PageDetailsType;
  performance: PerformanceMetrics;
}

export default function PageDetails({ details, performance }: PageDetailsProps) {
  const detailsItems = [
    { label: 'URL', value: details.url },
    { label: 'Final URL', value: details.finalUrl },
    { label: 'HTTP Status', value: details.httpStatus || 'Not available' },
    { label: 'Content Type', value: details.contentType || 'Not available' },
    { label: 'Response Time', value: details.responseTime ? `${details.responseTime} ms` : 'Not available' },
    { label: 'Page Size', value: details.pageSize ? `${Math.round(details.pageSize / 1024)} KB` : 'Not available' },
    { label: 'HTML Size', value: details.htmlSize ? `${Math.round(details.htmlSize / 1024)} KB` : 'Not available' },
    { label: 'Number of Links', value: details.linkCount ?? 'Not available' },
    { label: 'Number of Images', value: details.imageCount ?? 'Not available' },
    { label: 'Number of Scripts', value: details.scriptCount ?? 'Not available' },
    { label: 'Number of Stylesheets', value: details.stylesheetCount ?? 'Not available' },
    { label: 'HTTPS', value: details.isHttps ? 'Yes' : 'No' },
    { label: 'Robots.txt', value: details.hasRobotsTxt ? 'Found' : 'Not available' },
    { label: 'Sitemap', value: details.hasSitemap ? 'Found' : 'Not available' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {detailsItems.map((item) => (
        <div key={item.label} className="bg-navy-50 rounded-lg p-4">
          <div className="text-sm text-navy-500 mb-1">{item.label}</div>
          <div className="font-medium text-navy-900 break-all">{item.value}</div>
        </div>
      ))}
    </div>
  );
}
