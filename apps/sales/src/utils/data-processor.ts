import { parse, format } from "date-fns"

export interface OrderData {
  orderId: string
  date: Date
  status: string
  quantity: number
  amount: number
  currency: string
  category: string
  city: string
  state: string
}

export interface DailyMetrics {
  date: Date
  totalSales: number
  transactionCount: number
  averageOrderValue: number
}

export interface MonthlyMetrics {
  month: string
  totalSales: number
  transactionCount: number
  averageOrderValue: number
}

export interface CategoryMetrics {
  category: string
  totalSales: number
  transactionCount: number
}

export interface RegionMetrics {
  region: string
  totalSales: number
  transactionCount: number
}

export function parseCSVData(csvData: string): OrderData[] {
  const lines = csvData.trim().split("\n")
  const headers = lines[0].split(",")

  return lines
    .slice(1)
    .map((line) => {
      const values = line.split(",")
      const record: Record<string, string> = {}

      headers.forEach((header, index) => {
        record[header.trim()] = values[index]?.trim() || ""
      })

      const dateStr = record["Date"]
      let date: Date

      try {
        if (dateStr.includes("-")) {
          date = parse(dateStr, "MM-dd-yy", new Date())
        } else if (dateStr.includes("/")) {
          date = parse(dateStr, "MM/dd/yy", new Date())
        } else {
          date = new Date(dateStr)
        }
      } catch (e) {
        date = new Date()
      }

      const amount = Number.parseFloat(record["Amount"] || "0") || 0
      const quantity = Number.parseInt(record["Qty"] || "0") || 0

      return {
        orderId: record["Order ID"] || "",
        date,
        status: record["Status"] || "",
        quantity,
        amount,
        currency: record["currency"] || "INR",
        category: record["Category"] || "",
        city: record["ship-city"] || "",
        state: record["ship-state"] || "",
      }
    })
    .filter(
      (order) =>
        order.status !== "Cancelled" && order.amount > 0 && order.quantity > 0,
    )
}

export function calculateDailyMetrics(orders: OrderData[]): DailyMetrics[] {
  const dailyData = new Map<
    string,
    {
      totalSales: number
      transactionCount: number
    }
  >()

  orders.forEach((order) => {
    try {
      if (!(order.date instanceof Date) || isNaN(order.date.getTime())) {
        console.warn("Skipping order with invalid date:", order.orderId);
        return;
      }
      
      const dateKey = format(order.date, "yyyy-MM-dd")
      const existing = dailyData.get(dateKey) || { totalSales: 0, transactionCount: 0 }
      const amount = isNaN(order.amount) ? 0 : order.amount;

      dailyData.set(dateKey, {
        totalSales: existing.totalSales + amount,
        transactionCount: existing.transactionCount + 1,
      })
    } catch (e) {
      console.error("Error processing order for daily metrics:", e, order);
    }
  })

  return Array.from(dailyData.entries())
    .map(([dateStr, data]) => {
      const aov = data.transactionCount > 0 ? data.totalSales / data.transactionCount : 0

      return {
        date: new Date(dateStr),
        totalSales: data.totalSales,
        transactionCount: data.transactionCount,
        averageOrderValue: aov,
      }
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime())
}

export function calculateMonthlyMetrics(orders: OrderData[]): MonthlyMetrics[] {
  const monthlyData = new Map<
    string,
    {
      totalSales: number
      transactionCount: number
    }
  >()

  orders.forEach((order) => {
    try {
      if (!(order.date instanceof Date) || isNaN(order.date.getTime())) {
        console.warn("Skipping order with invalid date:", order.orderId);
        return;
      }
      
      const monthKey = format(order.date, "yyyy-MM")
      const existing = monthlyData.get(monthKey) || { totalSales: 0, transactionCount: 0 }
      const amount = isNaN(order.amount) ? 0 : order.amount;

      monthlyData.set(monthKey, {
        totalSales: existing.totalSales + amount,
        transactionCount: existing.transactionCount + 1,
      })
    } catch (e) {
      console.error("Error processing order for monthly metrics:", e, order);
    }
  })

  return Array.from(monthlyData.entries())
    .map(([monthKey, data]) => {
      const date = new Date(monthKey + "-01")
      const monthName = format(date, "MMM yyyy")

      const aov = data.transactionCount > 0 ? data.totalSales / data.transactionCount : 0

      return {
        month: monthName,
        totalSales: data.totalSales,
        transactionCount: data.transactionCount,
        averageOrderValue: aov,
      }
    })
    .sort((a, b) => {
      const dateA = new Date(a.month)
      const dateB = new Date(b.month)
      return dateA.getTime() - dateB.getTime()
    })
}

export function calculateCategoryMetrics(orders: OrderData[]): CategoryMetrics[] {
  const categoryData = new Map<
    string,
    {
      totalSales: number
      transactionCount: number
    }
  >()

  orders.forEach((order) => {
    try {
      const category = order.category || "Uncategorized"
      const existing = categoryData.get(category) || { totalSales: 0, transactionCount: 0 }
      const amount = isNaN(order.amount) ? 0 : order.amount;

      categoryData.set(category, {
        totalSales: existing.totalSales + amount,
        transactionCount: existing.transactionCount + 1,
      })
    } catch (e) {
      console.error("Error processing order for category metrics:", e, order);
    }
  })

  return Array.from(categoryData.entries())
    .map(([category, data]) => ({
      category,
      totalSales: data.totalSales,
      transactionCount: data.transactionCount,
    }))
    .sort((a, b) => b.totalSales - a.totalSales)
}

export function calculateRegionMetrics(orders: OrderData[]): RegionMetrics[] {
  const regionData = new Map<
    string,
    {
      totalSales: number
      transactionCount: number
    }
  >()

  orders.forEach((order) => {
    try {
      const region = order.state || "Unknown"
      const existing = regionData.get(region) || { totalSales: 0, transactionCount: 0 }
      const amount = isNaN(order.amount) ? 0 : order.amount;

      regionData.set(region, {
        totalSales: existing.totalSales + amount,
        transactionCount: existing.transactionCount + 1,
      })
    } catch (e) {
      console.error("Error processing order for region metrics:", e, order);
    }
  })

  return Array.from(regionData.entries())
    .map(([region, data]) => ({
      region,
      totalSales: data.totalSales,
      transactionCount: data.transactionCount,
    }))
    .sort((a, b) => b.totalSales - a.totalSales)
}

export const sampleOrdersData: OrderData[] = [
  {
    orderId: "171-9198151-1101146",
    date: new Date("2022-04-30"),
    status: "Shipped - Delivered to Buyer",
    quantity: 1,
    amount: 406,
    currency: "INR",
    category: "kurta",
    city: "BENGALURU",
    state: "KARNATAKA",
  },
  {
    orderId: "404-0687676-7273146",
    date: new Date("2022-04-30"),
    status: "Shipped",
    quantity: 1,
    amount: 329,
    currency: "INR",
    category: "kurta",
    city: "NAVI MUMBAI",
    state: "MAHARASHTRA",
  },
  {
    orderId: "407-1069790-7240320",
    date: new Date("2022-04-30"),
    status: "Shipped",
    quantity: 1,
    amount: 574,
    currency: "INR",
    category: "Top",
    city: "CHENNAI",
    state: "TAMIL NADU",
  },
  {
    orderId: "404-1490984-4578765",
    date: new Date("2022-04-30"),
    status: "Shipped",
    quantity: 1,
    amount: 824,
    currency: "INR",
    category: "Set",
    city: "GHAZIABAD",
    state: "UTTAR PRADESH",
  },
  {
    orderId: "408-5748499-6859555",
    date: new Date("2022-04-30"),
    status: "Shipped",
    quantity: 1,
    amount: 653,
    currency: "INR",
    category: "Set",
    city: "CHANDIGARH",
    state: "CHANDIGARH",
  },
  {
    orderId: "406-7807733-3785945",
    date: new Date("2022-04-30"),
    status: "Shipped - Delivered to Buyer",
    quantity: 1,
    amount: 399,
    currency: "INR",
    category: "kurta",
    city: "HYDERABAD",
    state: "TELANGANA",
  },
  {
    orderId: "402-4393761-0311520",
    date: new Date("2022-04-30"),
    status: "Shipped",
    quantity: 1,
    amount: 363,
    currency: "INR",
    category: "kurta",
    city: "Chennai",
    state: "TAMIL NADU",
  },
  {
    orderId: "407-5633625-6970741",
    date: new Date("2022-04-30"),
    status: "Shipped",
    quantity: 1,
    amount: 685,
    currency: "INR",
    category: "kurta",
    city: "CHENNAI",
    state: "TAMIL NADU",
  },
  // Adding more sample data for different dates to show trends
  {
    orderId: "123-4567890-1234567",
    date: new Date("2022-04-29"),
    status: "Shipped",
    quantity: 1,
    amount: 450,
    currency: "INR",
    category: "Western Dress",
    city: "MUMBAI",
    state: "MAHARASHTRA",
  },
  {
    orderId: "123-4567890-1234568",
    date: new Date("2022-04-29"),
    status: "Shipped",
    quantity: 2,
    amount: 900,
    currency: "INR",
    category: "Set",
    city: "DELHI",
    state: "DELHI",
  },
  {
    orderId: "123-4567890-1234569",
    date: new Date("2022-04-28"),
    status: "Shipped",
    quantity: 1,
    amount: 550,
    currency: "INR",
    category: "Top",
    city: "PUNE",
    state: "MAHARASHTRA",
  },
  {
    orderId: "123-4567890-1234570",
    date: new Date("2022-04-28"),
    status: "Shipped",
    quantity: 1,
    amount: 320,
    currency: "INR",
    category: "kurta",
    city: "BANGALORE",
    state: "KARNATAKA",
  },
  {
    orderId: "123-4567890-1234571",
    date: new Date("2022-04-27"),
    status: "Shipped",
    quantity: 3,
    amount: 1200,
    currency: "INR",
    category: "Set",
    city: "KOLKATA",
    state: "WEST BENGAL",
  },
  {
    orderId: "123-4567890-1234572",
    date: new Date("2022-04-26"),
    status: "Shipped",
    quantity: 1,
    amount: 480,
    currency: "INR",
    category: "Western Dress",
    city: "JAIPUR",
    state: "RAJASTHAN",
  },
  {
    orderId: "123-4567890-1234573",
    date: new Date("2022-04-25"),
    status: "Shipped",
    quantity: 2,
    amount: 750,
    currency: "INR",
    category: "kurta",
    city: "AHMEDABAD",
    state: "GUJARAT",
  },
  {
    orderId: "123-4567890-1234574",
    date: new Date("2022-03-30"),
    status: "Shipped",
    quantity: 1,
    amount: 420,
    currency: "INR",
    category: "Top",
    city: "LUCKNOW",
    state: "UTTAR PRADESH",
  },
  {
    orderId: "123-4567890-1234575",
    date: new Date("2022-03-29"),
    status: "Shipped",
    quantity: 1,
    amount: 380,
    currency: "INR",
    category: "kurta",
    city: "SURAT",
    state: "GUJARAT",
  },
  {
    orderId: "123-4567890-1234576",
    date: new Date("2022-03-15"),
    status: "Shipped",
    quantity: 2,
    amount: 920,
    currency: "INR",
    category: "Set",
    city: "HYDERABAD",
    state: "TELANGANA",
  },
  {
    orderId: "123-4567890-1234577",
    date: new Date("2022-03-10"),
    status: "Shipped",
    quantity: 1,
    amount: 540,
    currency: "INR",
    category: "Western Dress",
    city: "CHENNAI",
    state: "TAMIL NADU",
  },
  {
    orderId: "123-4567890-1234578",
    date: new Date("2022-03-05"),
    status: "Shipped",
    quantity: 1,
    amount: 620,
    currency: "INR",
    category: "Top",
    city: "PUNE",
    state: "MAHARASHTRA",
  },
  {
    orderId: "123-4567890-1234579",
    date: new Date("2022-02-28"),
    status: "Shipped",
    quantity: 3,
    amount: 1500,
    currency: "INR",
    category: "Set",
    city: "BANGALORE",
    state: "KARNATAKA",
  },
  {
    orderId: "123-4567890-1234580",
    date: new Date("2022-02-15"),
    status: "Shipped",
    quantity: 1,
    amount: 350,
    currency: "INR",
    category: "kurta",
    city: "MUMBAI",
    state: "MAHARASHTRA",
  },
]

export function generateSampleData() {
  const dailyMetrics = calculateDailyMetrics(sampleOrdersData)
  const monthlyMetrics = calculateMonthlyMetrics(sampleOrdersData)
  const categoryMetrics = calculateCategoryMetrics(sampleOrdersData)
  const regionMetrics = calculateRegionMetrics(sampleOrdersData)

  return {
    orders: sampleOrdersData,
    dailyMetrics,
    monthlyMetrics,
    categoryMetrics,
    regionMetrics,
  }
}

