/**
 * CSV Export Composable
 * Provides utilities for exporting data to CSV format
 */

export const useCSVExport = () => {
  /**
   * Convert array of objects to CSV string
   */
  const arrayToCSV = (data: Record<string, any>[], headers: string[]): string => {
    if (!data || data.length === 0) return "";

    // Create header row
    const headerRow = headers.join(",");

    // Create data rows
    const dataRows = data.map((row) => {
      return headers
        .map((header) => {
          const value = row[header];
          // Handle null/undefined
          if (value === null || value === undefined) return "";
          // Escape quotes and wrap in quotes if contains comma or quote
          const stringValue = String(value);
          if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(",");
    });

    return [headerRow, ...dataRows].join("\n");
  };

  /**
   * Download CSV file
   */
  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Export orders to CSV
   */
  const exportOrdersToCSV = (orders: any[], filename: string = "orders.csv") => {
    const headers = [
      "Order ID",
      "Product Name",
      "SKU",
      "Quantity",
      "Unit",
      "Unit Price",
      "Total Price",
      "Status",
      "Created By",
      "Created At",
      "Notes",
    ];

    const data = orders.map((order) => ({
      "Order ID": order.id,
      "Product Name": order.product?.name || "-",
      SKU: order.product?.sku || "-",
      Quantity: order.quantity,
      Unit: order.product?.unit || "-",
      "Unit Price": order.product?.unit_price || 0,
      "Total Price": order.total_price,
      Status: order.status,
      "Created By": order.user?.name || "-",
      "Created At": new Date(order.created_at).toLocaleString(),
      Notes: order.notes || "",
    }));

    const csv = arrayToCSV(data, headers);
    downloadCSV(csv, filename);
  };

  /**
   * Export packaging products to CSV
   */
  const exportPackagingToCSV = (products: any[], filename: string = "packaging-products.csv") => {
    const headers = [
      "Product ID",
      "Name",
      "SKU",
      "Description",
      "Unit",
      "Unit Price",
      "Stock Quantity",
      "Category",
      "Status",
      "Created At",
    ];

    const data = products.map((product) => ({
      "Product ID": product.id,
      Name: product.name,
      SKU: product.sku,
      Description: product.description || "",
      Unit: product.unit,
      "Unit Price": product.unit_price,
      "Stock Quantity": product.stock_quantity,
      Category: product.category || "",
      Status: product.is_active ? "Active" : "Inactive",
      "Created At": new Date(product.created_at).toLocaleString(),
    }));

    const csv = arrayToCSV(data, headers);
    downloadCSV(csv, filename);
  };

  /**
   * Export activity logs to CSV
   */
  const exportActivityLogsToCSV = (logs: any[], filename: string = "activity-logs.csv") => {
    const headers = ["Time", "User", "Email", "Action", "Entity Type", "Entity Name", "Details"];

    const data = logs.map((log) => ({
      Time: new Date(log.created_at).toLocaleString(),
      User: log.user?.name || "Unknown",
      Email: log.user?.email || "-",
      Action: log.action,
      "Entity Type": log.entity_type,
      "Entity Name": log.entity_name || "-",
      Details: log.details ? JSON.stringify(log.details) : "",
    }));

    const csv = arrayToCSV(data, headers);
    downloadCSV(csv, filename);
  };

  return {
    arrayToCSV,
    downloadCSV,
    exportOrdersToCSV,
    exportPackagingToCSV,
    exportActivityLogsToCSV,
  };
};
