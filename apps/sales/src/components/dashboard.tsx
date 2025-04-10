'use client';

import { format, subDays, parse } from 'date-fns';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart } from './charts/bar-chart';
import { LineChart } from './charts/line-chart';
import { PieChart } from './charts/pie-chart';
import { DashboardHeader } from './dashboard-header';
import { CSVUploader } from './csv-uploader';
import { StatsCard } from './stats-card';
import { DateRangePicker } from './date-range-picker';
import type { DateRange } from 'react-day-picker';
import { motion } from 'framer-motion';
import {
  generateSampleData,
  type OrderData,
  type DailyMetrics,
  type MonthlyMetrics,
  type CategoryMetrics,
  type RegionMetrics,
  calculateDailyMetrics,
  calculateMonthlyMetrics,
  calculateCategoryMetrics,
  calculateRegionMetrics,
} from '@/utils/data-processor';
import { BarChart3, Calendar, DollarSign, ShoppingCart, TrendingUp, Map, Tag, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { StackOrderChart } from './charts/stack-order-chart';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showUploader, setShowUploader] = useState(false);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 10),
    to: new Date(),
  });
  const [data, setData] = useState<{
    dailyMetrics: DailyMetrics[];
    monthlyMetrics: MonthlyMetrics[];
    categoryMetrics: CategoryMetrics[];
    regionMetrics: RegionMetrics[];
  }>({
    dailyMetrics: [],
    monthlyMetrics: [],
    categoryMetrics: [],
    regionMetrics: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  useEffect(() => {
    const sampleData = generateSampleData();
    setOrders(sampleData.orders);
    setData({
      dailyMetrics: sampleData.dailyMetrics,
      monthlyMetrics: sampleData.monthlyMetrics,
      categoryMetrics: sampleData.categoryMetrics,
      regionMetrics: sampleData.regionMetrics,
    });
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (orders.length === 0) return;

    let filteredOrders = orders;
    if (dateRange?.from && dateRange?.to) {
      filteredOrders = orders.filter((order) => {
        if (!(order.date instanceof Date) || isNaN(order.date.getTime())) {
          return false;
        }

        const orderDateStr = format(order.date, 'yyyy-MM-dd');
        const fromDateStr = format(dateRange.from!, 'yyyy-MM-dd');
        const toDateStr = format(dateRange.to!, 'yyyy-MM-dd');

        return orderDateStr >= fromDateStr && orderDateStr <= toDateStr;
      });

      if (filteredOrders.length === 0 && orders.length > 0) {
        const sampleOrders = orders.slice(0, 5);

        let minDate = new Date();
        let maxDate = new Date(0);

        orders.forEach((order) => {
          if (order.date instanceof Date && !isNaN(order.date.getTime())) {
            if (order.date < minDate) minDate = new Date(order.date);
            if (order.date > maxDate) maxDate = new Date(order.date);
          }
        });

        if (minDate < maxDate) {
          setDateRange({
            from: subDays(maxDate, 30),
            to: maxDate,
          });

          return;
        }

        filteredOrders = orders;
      }
    }

    if (selectedCategory) {
      filteredOrders = filteredOrders.filter((order) => order.category === selectedCategory);
    }

    if (selectedRegion) {
      filteredOrders = filteredOrders.filter((order) => order.state === selectedRegion);
    }

    const dailyMetrics = calculateDailyMetrics(filteredOrders);
    const monthlyMetrics = calculateMonthlyMetrics(filteredOrders);
    const categoryMetrics = calculateCategoryMetrics(filteredOrders);
    const regionMetrics = calculateRegionMetrics(filteredOrders);

    setData({
      dailyMetrics,
      monthlyMetrics,
      categoryMetrics,
      regionMetrics,
    });

    setIsLoading(false);
  }, [orders, dateRange, selectedCategory, selectedRegion]);

  const handleDataLoaded = (csvRows: string[][]) => {
    const headers = csvRows[0];
    const dataRows = csvRows.slice(1);

    if (!headers || headers.length < 10) {
      alert("CSV format is not valid. Make sure you're uploading the correct Amazon order report.");
      return;
    }

    const processedData = dataRows
      .map((row) => {
        if (!row || row.length < 2) return null;

        try {
          let orderDate: Date;
          const dateStr = row[2] || '';

          try {
            if (dateStr.includes('-')) {
              try {
                orderDate = parse(dateStr, 'MM-dd-yy', new Date());
                if (isNaN(orderDate.getTime())) {
                  throw new Error('Invalid date with MM-dd-yy format');
                }
              } catch (e) {
                try {
                  orderDate = parse(dateStr, 'dd-MM-yy', new Date());
                  if (isNaN(orderDate.getTime())) {
                    throw new Error('Invalid date with dd-MM-yy format');
                  }
                } catch (e2) {
                  orderDate = parse(dateStr, 'yyyy-MM-dd', new Date());
                }
              }
            } else if (dateStr.includes('/')) {
              try {
                orderDate = parse(dateStr, 'MM/dd/yy', new Date());
                if (isNaN(orderDate.getTime())) {
                  throw new Error('Invalid date with MM/dd/yy format');
                }
              } catch (e) {
                orderDate = parse(dateStr, 'dd/MM/yy', new Date());
              }
            } else {
              orderDate = new Date(dateStr);
            }

            if (isNaN(orderDate.getTime())) {
              throw new Error('Invalid date after all format attempts');
            }

            orderDate.setHours(12, 0, 0, 0);
          } catch (e) {
            try {
              orderDate = new Date(dateStr);
              if (isNaN(orderDate.getTime())) {
                throw new Error('Invalid date from direct conversion');
              }
              orderDate.setHours(12, 0, 0, 0);
            } catch (e2) {
              orderDate = subDays(new Date(), 15);
              orderDate.setHours(12, 0, 0, 0);
            }
          }

          const quantity = parseInt(row[13] || '0', 10);
          const amount = parseFloat(row[15] || '0');

          return {
            orderId: row[1] || '',
            date: orderDate,
            status: row[3] || '',
            quantity: quantity || 1,
            amount: amount || 1,
            currency: row[14] || 'INR',
            category: row[9] || 'Uncategorized',
            city: row[16] || 'Unknown',
            state: row[17] || 'Unknown',
          };
        } catch (e) {
          return null;
        }
      })
      .filter((order): order is OrderData => order !== null);

    if (processedData.length === 0) {
      alert(
        'No valid orders found in the CSV. Please check your file and try again. The dashboard will display sample data for now.',
      );

      const sampleData = generateSampleData();
      setOrders(sampleData.orders);
      setData({
        dailyMetrics: sampleData.dailyMetrics,
        monthlyMetrics: sampleData.monthlyMetrics,
        categoryMetrics: sampleData.categoryMetrics,
        regionMetrics: sampleData.regionMetrics,
      });
      setIsLoading(false);
      return;
    }

    setOrders(processedData);

    let minDate = new Date();
    let maxDate = new Date(0);

    processedData.forEach((order) => {
      if (order.date instanceof Date && !isNaN(order.date.getTime())) {
        if (order.date < minDate) minDate = new Date(order.date);
        if (order.date > maxDate) maxDate = new Date(order.date);
      }
    });

    if (minDate < maxDate) {
      setDateRange({
        from: subDays(maxDate, 30),
        to: maxDate,
      });
    }

    const dailyMetrics = calculateDailyMetrics(processedData);
    const monthlyMetrics = calculateMonthlyMetrics(processedData);
    const categoryMetrics = calculateCategoryMetrics(processedData);
    const regionMetrics = calculateRegionMetrics(processedData);

    setData({
      dailyMetrics,
      monthlyMetrics,
      categoryMetrics,
      regionMetrics,
    });

    setShowUploader(false);
    setIsLoading(false);

    setSelectedCategory(null);
    setSelectedRegion(null);
  };

  const calculateSummary = () => {
    const metrics = data.dailyMetrics;

    if (!metrics.length)
      return {
        totalSales: 0,
        totalTransactions: 0,
        avgOrderValue: 0,
        salesTrend: 0,
        transactionsTrend: 0,
        aovTrend: 0,
      };

    const totalSales = metrics.reduce((sum, item) => sum + item.totalSales, 0);
    const totalTransactions = metrics.reduce((sum, item) => sum + item.transactionCount, 0);
    const avgOrderValue = totalSales / totalTransactions || 0;

    const midpoint = Math.floor(metrics.length / 2);
    const firstHalfSales = metrics.slice(0, midpoint).reduce((sum, item) => sum + item.totalSales, 0);
    const secondHalfSales = metrics.slice(midpoint).reduce((sum, item) => sum + item.totalSales, 0);
    const salesTrend = firstHalfSales > 0 ? Math.round(((secondHalfSales - firstHalfSales) / firstHalfSales) * 100) : 0;

    const firstHalfTransactions = metrics.slice(0, midpoint).reduce((sum, item) => sum + item.transactionCount, 0);
    const secondHalfTransactions = metrics.slice(midpoint).reduce((sum, item) => sum + item.transactionCount, 0);
    const transactionsTrend =
      firstHalfTransactions > 0
        ? Math.round(((secondHalfTransactions - firstHalfTransactions) / firstHalfTransactions) * 100)
        : 0;

    const firstHalfAOV = firstHalfSales / firstHalfTransactions || 0;
    const secondHalfAOV = secondHalfSales / secondHalfTransactions || 0;
    const aovTrend = firstHalfAOV > 0 ? Math.round(((secondHalfAOV - firstHalfAOV) / firstHalfAOV) * 100) : 0;

    return {
      totalSales,
      totalTransactions,
      avgOrderValue,
      salesTrend,
      transactionsTrend,
      aovTrend,
    };
  };

  const summary = calculateSummary();

  const formatDate = (date: Date) => format(date, 'MMM dd');

  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedRegion(null);
    setDateRange({
      from: subDays(new Date(), 30),
      to: new Date(),
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* <DashboardHeader onUploadClick={() => setShowUploader(true)} /> */}
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-3xl font-bold tracking-tight"></h2>
            {(selectedCategory || selectedRegion) && (
              <p className="text-muted-foreground">
                Filtered by: {selectedCategory && `Category: ${selectedCategory}`}
                {selectedCategory && selectedRegion && ' | '}
                {selectedRegion && `Region: ${selectedRegion}`}
              </p>
            )}
          </motion.div>

          <div className="flex items-center space-x-2">
            <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} className="z-10" />
            {(selectedCategory || selectedRegion) && (
              <Button variant="outline" size="icon" className="h-10 bg-teal-600" onClick={resetFilters}>
                <RefreshCw className="h-4 w-4 invert" />
                <span className="sr-only">Reset Filters</span>
              </Button>
            )}
          </div>
        </div>

        {showUploader ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="my-8"
          >
            <CSVUploader onDataLoaded={handleDataLoaded} />
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setShowUploader(false)}>
                Cancel
              </Button>
            </div>
          </motion.div>
        ) : (
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-3 md:w-[400px]">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="regions">Regions</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader className="h-10 bg-muted rounded-t-lg" />
                      <CardContent className="h-20 bg-muted/50 rounded-b-lg" />
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <StatsCard
                    title="Total Revenue"
                    value={formatCurrency(summary.totalSales)}
                    description="For the selected period"
                    icon={DollarSign}
                    trend={{
                      value: summary.salesTrend,
                      label: 'vs. previous period',
                    }}
                    delay={0.1}
                  />
                  <StatsCard
                    title="Transactions"
                    value={summary.totalTransactions}
                    description="Total orders"
                    icon={ShoppingCart}
                    trend={{
                      value: summary.transactionsTrend,
                      label: 'vs. previous period',
                    }}
                    delay={0.2}
                  />
                  <StatsCard
                    title="Average Order Value"
                    value={formatCurrency(summary.avgOrderValue)}
                    description="Per transaction"
                    icon={TrendingUp}
                    trend={{
                      value: summary.aovTrend,
                      label: 'vs. previous period',
                    }}
                    delay={0.3}
                  />
                  <StatsCard
                    title="Active Period"
                    value={`${data.dailyMetrics.length} days`}
                    description={
                      dateRange?.from && dateRange?.to
                        ? `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd')}`
                        : 'All time'
                    }
                    icon={Calendar}
                    delay={0.4}
                  />
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle>Daily Sales</CardTitle>
                    <CardDescription>Total sales per day</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    {data.dailyMetrics.length > 0 ? (
                      <BarChart
                        data={data.dailyMetrics.map((d) => ({
                          date: d.date,
                          value: d.totalSales,
                        }))}
                        xKey="date"
                        yKey="value"
                        xLabel="Date"
                        yLabel="Sales (INR)"
                        formatX={(d) => formatDate(d instanceof Date ? d : new Date(d))}
                        formatY={(d) => formatCurrency(d)}
                        height={350}
                      />
                    ) : (
                      <div className="flex h-[350px] items-center justify-center">
                        <p className="text-muted-foreground">No data available for the selected filters</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <div className="grid gap-4 md:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Daily Transactions</CardTitle>
                      <CardDescription>Number of orders per day</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                      {data.dailyMetrics.length > 0 ? (
                        <BarChart
                          data={data.dailyMetrics.map((d) => ({
                            date: d.date,
                            value: d.transactionCount,
                          }))}
                          xKey="date"
                          yKey="value"
                          xLabel="Date"
                          yLabel="Number of Orders"
                          formatX={(d) => formatDate(d instanceof Date ? d : new Date(d))}
                          formatY={(d) => d.toString()}
                          color="hsl(var(--primary) / 0.8)"
                          height={300}
                        />
                      ) : (
                        <div className="flex h-[300px] items-center justify-center">
                          <p className="text-muted-foreground">No data available for the selected filters</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Average Order Value</CardTitle>
                      <CardDescription>Average value per order per day</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                      {data.dailyMetrics.length > 0 ? (
                        <LineChart
                          data={data.dailyMetrics.map((d) => ({
                            date: d.date,
                            value: d.averageOrderValue,
                          }))}
                          xKey="date"
                          yKey="value"
                          xLabel="Date"
                          yLabel="AOV (INR)"
                          formatX={(d) => formatDate(d instanceof Date ? d : new Date(d))}
                          formatY={(d) => formatCurrency(d)}
                          color="hsl(var(--primary) / 0.7)"
                          height={300}
                        />
                      ) : (
                        <div className="flex h-[300px] items-center justify-center">
                          <p className="text-muted-foreground">No data available for the selected filters</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Trend</CardTitle>
                    <CardDescription>Daily revenue over time</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    {data.dailyMetrics.length > 0 ? (
                      <StackOrderChart
                        data={data.dailyMetrics.map((d) => ({
                          date: d.date,
                          transactions: d.transactionCount,
                          revenue: d.totalSales,
                          average: d.averageOrderValue ?? 0,
                        }))}
                        keys={['transactions', 'revenue', 'average']}
                        xKey="date"
                        xLabel="Date"
                        yLabel="Revenue (INR)"
                        formatX={(d) => formatDate(d instanceof Date ? d : new Date(d))}
                        formatY={(d) => String(d)}
                        height={350}
                      />
                    ) : (
                      <div className="flex h-[350px] items-center justify-center">
                        <p className="text-muted-foreground">No data available for the selected filters</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Tag className="mr-2 h-5 w-5" />
                        Product Categories
                      </CardTitle>
                      <CardDescription>Sales distribution by product category</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {data.categoryMetrics.length > 0 ? (
                        <PieChart
                          data={data.categoryMetrics.map((d) => ({
                            name: d.category,
                            value: d.totalSales,
                          }))}
                          nameKey="name"
                          valueKey="value"
                          formatValue={(d) => formatCurrency(d)}
                          height={350}
                          onSliceClick={(item) => setSelectedCategory(item.name)}
                        />
                      ) : (
                        <div className="flex h-[350px] items-center justify-center">
                          <p className="text-muted-foreground">No category data available</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Category Transactions</CardTitle>
                      <CardDescription>Number of orders by category</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                      {data.categoryMetrics.length > 0 ? (
                        <BarChart
                          data={data.categoryMetrics.map((d) => ({
                            date: d.category,
                            value: d.transactionCount,
                          }))}
                          xKey="date"
                          yKey="value"
                          xLabel="Category"
                          yLabel="Number of Orders"
                          formatX={(d) => d.toString()}
                          formatY={(d) => d.toString()}
                          color="hsl(var(--primary) / 0.8)"
                          height={350}
                        />
                      ) : (
                        <div className="flex h-[350px] items-center justify-center">
                          <p className="text-muted-foreground">No category data available</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {selectedCategory && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Alert>
                    <BarChart3 className="h-4 w-4" />
                    <AlertTitle>Category Filter Applied</AlertTitle>
                    <AlertDescription>
                      Showing data for category: <strong>{selectedCategory}</strong>. Click on the pie chart to select a
                      different category or use the Reset Filters button.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </TabsContent>

            {/* Regions Tab */}
            <TabsContent value="regions" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Map className="mr-2 h-5 w-5" />
                        Sales by Region
                      </CardTitle>
                      <CardDescription>Sales distribution by state/region</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {data.regionMetrics.length > 0 ? (
                        <PieChart
                          data={data.regionMetrics.map((d) => ({
                            name: d.region,
                            value: d.totalSales,
                          }))}
                          nameKey="name"
                          valueKey="value"
                          formatValue={(d) => formatCurrency(d)}
                          height={350}
                          onSliceClick={(item) => setSelectedRegion(item.name)}
                        />
                      ) : (
                        <div className="flex h-[350px] items-center justify-center">
                          <p className="text-muted-foreground">No region data available</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Region Transactions</CardTitle>
                      <CardDescription>Number of orders by region</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                      {data.regionMetrics.length > 0 ? (
                        <BarChart
                          data={data.regionMetrics.map((d) => ({
                            date: d.region,
                            value: d.transactionCount,
                          }))}
                          xKey="date"
                          yKey="value"
                          xLabel="Region"
                          yLabel="Number of Orders"
                          formatX={(d) => d.toString()}
                          formatY={(d) => d.toString()}
                          color="hsl(var(--primary) / 0.8)"
                          height={350}
                        />
                      ) : (
                        <div className="flex h-[350px] items-center justify-center">
                          <p className="text-muted-foreground">No region data available</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {selectedRegion && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Alert>
                    <Map className="h-4 w-4" />
                    <AlertTitle>Region Filter Applied</AlertTitle>
                    <AlertDescription>
                      Showing data for region: <strong>{selectedRegion}</strong>. Click on the pie chart to select a
                      different region or use the Reset Filters button.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
