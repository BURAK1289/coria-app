'use client';

import { useTranslations, useMessages } from 'next-intl';
import Image from 'next/image';

import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { getMessageArray } from '@/lib/messages';
import { isNonEmptyString, isValidObject } from '@/lib/type-guards';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  linkedin?: string;
  twitter?: string;
}

function isTeamMember(value: unknown): value is TeamMember {
  if (!isValidObject(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.name) &&
    isNonEmptyString(value.role) &&
    isNonEmptyString(value.bio) &&
    isNonEmptyString(value.image) &&
    (value.linkedin === undefined || isNonEmptyString(value.linkedin)) &&
    (value.twitter === undefined || isNonEmptyString(value.twitter))
  );
}

export function TeamProfiles() {
  const t = useTranslations('about.team');
  const messages = useMessages();
  const teamMembers = getMessageArray(messages, ['about', 'team', 'members'], isTeamMember);

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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teamMembers.map((member) => (
          <TeamMemberCard key={member.id} member={member} />
        ))}
      </div>

      {/* Leadership Message */}
      <div className="mt-16 bg-gradient-to-r from-coria-green/5 to-water/5 rounded-2xl p-8">
        <div className="max-w-4xl mx-auto text-center">
          <Typography variant="h3" className="mb-6 text-coria-green">
            {t('leadership.title')}
          </Typography>
          <Typography variant="body-large" className="text-gray-700 leading-relaxed mb-6">
            {t('leadership.message')}
          </Typography>
          <Typography variant="body" className="text-gray-600 italic">
            — {t('leadership.signature')}
          </Typography>
        </div>
      </div>
    </div>
  );
}

function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <Card className="p-6 text-center hover:shadow-lg transition-shadow">
      <div className="relative w-24 h-24 mx-auto mb-4">
        <Image
          src={member.image}
          alt={member.name}
          fill
          className="rounded-full object-cover"
        />
      </div>
      
      <Typography variant="h4" className="mb-2">
        {member.name}
      </Typography>
      
      <Typography variant="body-small" className="text-coria-green font-medium mb-4">
        {member.role}
      </Typography>
      
      <Typography variant="body-small" className="text-gray-600 leading-relaxed mb-6">
        {member.bio}
      </Typography>
      
      {/* Social Links */}
      <div className="flex justify-center space-x-4">
        {member.linkedin && (
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-coria-green transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
        )}
        {member.twitter && (
          <a
            href={member.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-coria-green transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
          </a>
        )}
      </div>
    </Card>
  );
}
