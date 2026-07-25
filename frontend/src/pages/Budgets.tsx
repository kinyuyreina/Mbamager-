import * as React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PieChart, Plus } from 'lucide-react';

export default function Budgets() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Category Budgets"
        description="Limit your category spending and trigger real-time low-balance budget alerts."
        action={
          <Button variant="primary" size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Set Budget Limit
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Sprint F2 - Budget Thresholds & Warnings</CardTitle>
          <CardDescription>
            Creating custom budgets, category limit configurations, and dynamic progress progress bars will be fully implemented in Sprint F2.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mt-2">
            <div className="p-4 border border-slate-900 rounded-xl flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-200">
                <span>Food & Groceries</span>
                <span className="text-[10px] text-slate-500">Spent: 85,000 FCFA / Limit: 100,000 FCFA</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-rose-400 h-1.5 rounded-full w-[85%]" />
              </div>
            </div>

            <div className="p-4 border border-slate-800 bg-slate-900/40 rounded-xl flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-200">
                <span>Canal+ / Subscriptions</span>
                <span className="text-[10px] text-slate-500">Spent: 10,000 FCFA / Limit: 15,000 FCFA</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-gold to-gold-300 h-1.5 rounded-full w-[66%]" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
