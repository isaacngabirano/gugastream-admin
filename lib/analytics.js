// lib/analytics.js
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "./firebase";

// Constants for Pricing
const PACKAGES = {
  SINGLE: 1000,
  WEEKLY: 10000,
  MONTHLY: 30000
};

// VJ List Configuration
export const VJ_LIST = ["VJ Junior", "VJ Jingo", "VJ Mark", "VJ Ice P", "VJ Emmy"];

// Categories List Configuration
export const CATEGORY_LIST = [
  "Action", "Thriller", "Adventure", "Horror", "Drama", "Comedy", 
  "Romance", "Sci-Fi", "Fantasy", "Animation", "Documentary", 
  "Crime", "Mystery", "Family"
];

// Calculate popularity score (Views weighted by recency could be implemented here)
// For now, simple view count is used as proxy
export const calculatePopularity = (views, createdAt) => {
  // Placeholder logic
  return views;
};

// Check if movie is 'New' (added within last 14 days)
export const isNewRelease = (createdAt) => {
  if (!createdAt) return false;
  const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 14;
};

// Mock Data Generators for Visualization (until backend logs are populated)
export const generateMockPackageData = () => [
  { name: "Single Movie", revenue: 450000, users: 450 },
  { name: "Weekly", revenue: 1200000, users: 120 },
  { name: "Monthly", revenue: 2400000, users: 80 }
];

export const generateMockGrowthData = () => [
  { name: "Week 1", subscribers: 20 },
  { name: "Week 2", subscribers: 45 },
  { name: "Week 3", subscribers: 70 },
  { name: "Week 4", subscribers: 110 }
];

export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || !data.length) return;
  const separator = ',';
  const keys = Object.keys(data[0]);
  const csvContent = [
    keys.join(separator),
    ...data.map(row => keys.map(key => `"${row[key]}"`).join(separator))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
