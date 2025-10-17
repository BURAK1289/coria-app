'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslations, useMessages } from 'next-intl';

import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { getMessageArray } from '@/lib/messages';
import { isNonEmptyString, isValidObject } from '@/lib/type-guards';

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedTime: string;
  icon: string;
}

type SupportPriority = SupportTicket['priority'];

type SlaVariant = 'leaf' | 'water' | 'coral' | 'urgent';

function isSupportTicket(value: unknown): value is SupportTicket {
  if (!isValidObject(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.title) &&
    isNonEmptyString(value.description) &&
    isNonEmptyString(value.category) &&
    isNonEmptyString(value.estimatedTime) &&
    isNonEmptyString(value.icon) &&
    (['low', 'medium', 'high', 'urgent'] as SupportPriority[]).includes(
      value.priority as SupportPriority,
    )
  );
}

export function SupportTicketing() {
  const t = useTranslations('contact.support');
  const messages = useMessages();
  const [selectedTicketType, setSelectedTicketType] = useState<string | null>(null);

  const ticketTypes = getMessageArray(messages, ['contact', 'support', 'ticketTypes'], isSupportTicket);

  const handleTicketSelect = (ticketId: string) => {
    setSelectedTicketType(ticketId);
    // In a real implementation, this would redirect to a ticket creation form
  };

  const getPriorityColor = (priority: SupportPriority) => {
    switch (priority) {
      case 'low':
        return 'text-leaf bg-leaf/10 border-leaf/20';
      case 'medium':
        return 'text-water bg-water/10 border-water/20';
      case 'high':
        return 'text-coral bg-coral/10 border-coral/20';
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getTicketIcon = (iconName: string): ReactNode => {
    switch (iconName) {
      case 'bug':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'feature':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'account':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'billing':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case 'technical':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'partnership':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <Typography variant="h2" className="mb-4">
          {t('title')}
        </Typography>
        <Typography variant="body-large" className="text-gray-600 max-w-3xl mx-auto">
          {t('subtitle')}
        </Typography>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ticketTypes.map((ticket) => (
          <SupportTicketCard
            key={ticket.id}
            ticket={ticket}
            isSelected={selectedTicketType === ticket.id}
            onSelect={() => handleTicketSelect(ticket.id)}
            getPriorityColor={getPriorityColor}
            getTicketIcon={getTicketIcon}
          />
        ))}
      </div>

      {/* Ticket Status Tracking */}
      <div className="mt-16 bg-gradient-to-r from-coria-green/5 to-water/5 rounded-2xl p-8">
        <div className="text-center mb-8">
          <Typography variant="h3" className="mb-4 text-coria-green">
            {t('tracking.title')}
          </Typography>
          <Typography variant="body" className="text-gray-700">
            {t('tracking.description')}
          </Typography>
        </div>

        <div className="max-w-md mx-auto">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder={t('tracking.placeholder')}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coria-green focus:border-transparent"
            />
            <button className="bg-coria-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-coria-green/90 transition-colors">
              {t('tracking.track')}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            {t('tracking.help')}
          </p>
        </div>
      </div>

      {/* SLA Information */}
      <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SlaCard
          title={t('sla.low.time')}
          description={t('sla.low.description')}
          variant="leaf"
        />
        <SlaCard
          title={t('sla.medium.time')}
          description={t('sla.medium.description')}
          variant="water"
        />
        <SlaCard
          title={t('sla.high.time')}
          description={t('sla.high.description')}
          variant="coral"
        />
        <SlaCard
          title={t('sla.urgent.time')}
          description={t('sla.urgent.description')}
          variant="urgent"
        />
      </div>
    </div>
  );
}

function SupportTicketCard({
  ticket,
  isSelected,
  onSelect,
  getPriorityColor,
  getTicketIcon,
}: {
  ticket: SupportTicket;
  isSelected: boolean;
  onSelect: () => void;
  getPriorityColor: (priority: SupportPriority) => string;
  getTicketIcon: (iconName: string) => ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`text-left h-full ${isSelected ? 'outline outline-2 outline-coria-green rounded-lg' : ''}`}
    >
      <Card className="p-6 h-full">
        <div className="flex items-start justify-between mb-4">
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
            {ticket.priority.toUpperCase()}
          </div>
          <div className="w-10 h-10 bg-coria-green/10 rounded-full flex items-center justify-center text-coria-green">
            {getTicketIcon(ticket.icon)}
          </div>
        </div>

        <Typography variant="h4" className="mb-2">
          {ticket.title}
        </Typography>

        <Typography variant="body-small" className="text-gray-600 leading-relaxed mb-4">
          {ticket.description}
        </Typography>

        <div className="text-sm text-gray-500">
          <strong>{ticket.category}</strong>
          <div>{ticket.estimatedTime}</div>
        </div>
      </Card>
    </button>
  );
}

function SlaCard({
  title,
  description,
  variant,
}: {
  title: string;
  description: string;
  variant: SlaVariant;
}) {
  const variantMap: Record<SlaVariant, { bg: string; text: string }> = {
    leaf: { bg: 'bg-leaf/10', text: 'text-leaf' },
    water: { bg: 'bg-water/10', text: 'text-water' },
    coral: { bg: 'bg-coral/10', text: 'text-coral' },
    urgent: { bg: 'bg-red-50', text: 'text-red-600' },
  };

  const colors = variantMap[variant];

  return (
    <div className="text-center p-6 bg-white rounded-lg border border-gray-200">
      <div className={`w-12 h-12 ${colors.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
        <svg className={`w-6 h-6 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <Typography variant="h4" className={`mb-2 ${colors.text}`}>
        {title}
      </Typography>
      <Typography variant="body-small" className="text-gray-600">
        {description}
      </Typography>
    </div>
  );
}
