import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const SettingsPage = () => {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-serif mb-6">Store Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>General Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Store Name</label>
            <input type="text" defaultValue="Alliraa Textile" className="w-full border border-border p-2 bg-background rounded-md" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Contact Email</label>
            <input type="email" defaultValue="hello@alliraa.com" className="w-full border border-border p-2 bg-background rounded-md" />
          </div>
          <Button className="mt-4">Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;