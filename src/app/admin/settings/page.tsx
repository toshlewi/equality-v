"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Save, Loader2 } from "lucide-react";

interface Setting {
  id: string;
  key: string;
  value: any;
  type: string;
  description?: string;
  category: string;
  isPublic: boolean;
  isRequired: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
}

interface SettingsData {
  settings: Record<string, Setting[]>;
  categories: string[];
}

export default function SettingsPage() {
  const [settingsData, setSettingsData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [editedSettings, setEditedSettings] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();

      if (data.success) {
        setSettingsData(data.data);
        // Initialize edited settings with current values
        const edited: Record<string, any> = {};
        Object.values(data.data.settings).flat().forEach((setting: Setting) => {
          edited[setting.key] = setting.value;
        });
        setEditedSettings(edited);
      } else {
        console.error('Failed to fetch settings:', data.error);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key: string, value: any) => {
    setSaving(prev => ({ ...prev, [key]: true }));
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });

      const data = await res.json();

      if (data.success) {
        alert('Setting saved successfully!');
        fetchSettings();
      } else {
        alert(`Failed to save: ${data.error}`);
      }
    } catch (error) {
      console.error('Error saving setting:', error);
      alert('Failed to save setting');
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleValueChange = (key: string, value: any) => {
    setEditedSettings(prev => ({ ...prev, [key]: value }));
  };

  const renderSettingInput = (setting: Setting) => {
    const value = editedSettings[setting.key] ?? setting.value;

    switch (setting.type) {
      case 'boolean':
        return (
          <Select
            value={value ? 'true' : 'false'}
            onValueChange={(val) => handleValueChange(setting.key, val === 'true')}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Enabled</SelectItem>
              <SelectItem value="false">Disabled</SelectItem>
            </SelectContent>
          </Select>
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleValueChange(setting.key, parseFloat(e.target.value) || 0)}
            min={setting.validation?.min}
            max={setting.validation?.max}
          />
        );

      case 'email':
      case 'url':
        return (
          <Input
            type={setting.type === 'email' ? 'email' : 'url'}
            value={value}
            onChange={(e) => handleValueChange(setting.key, e.target.value)}
          />
        );

      case 'text':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleValueChange(setting.key, e.target.value)}
            rows={4}
          />
        );

      case 'json':
      case 'array':
        return (
          <Textarea
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleValueChange(setting.key, parsed);
              } catch {
                handleValueChange(setting.key, e.target.value);
              }
            }}
            rows={6}
            className="font-mono text-sm"
          />
        );

      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleValueChange(setting.key, e.target.value)}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Loading settings...</div>
      </div>
    );
  }

  if (!settingsData) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Failed to load settings</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Settings</h1>
        <p className="text-gray-600">Manage application settings</p>
      </div>

      {settingsData.categories.map((category) => (
        <div key={category} className="bg-white p-6 rounded-lg border space-y-4">
          <h2 className="text-lg font-semibold capitalize">{category}</h2>
          
          {settingsData.settings[category]?.map((setting) => (
            <div key={setting.id} className="space-y-2 border-b pb-4 last:border-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <label className="font-medium">{setting.key}</label>
                    {setting.isPublic && (
                      <Badge variant="outline" className="text-xs">Public</Badge>
                    )}
                    {setting.isRequired && (
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">{setting.type}</Badge>
                  </div>
                  {setting.description && (
                    <p className="text-sm text-gray-600 mb-2">{setting.description}</p>
                  )}
                  <div className="mt-2">
                    {renderSettingInput(setting)}
                  </div>
                </div>
                <Button
                  onClick={() => handleSave(setting.key, editedSettings[setting.key] ?? setting.value)}
                  disabled={saving[setting.key]}
                  size="sm"
                >
                  {saving[setting.key] ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

