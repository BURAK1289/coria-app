import { Container, Heading, Text } from '@/components/ui';

export default function PrivacyPage() {
  return (
    <Container size="lg" padding="md" className="py-24 space-y-6">
      <Heading as="h1" size="3xl" weight="bold" className="text-[var(--coria-primary)]">
        Gizlilik Politikası
      </Heading>
      <Text size="sm" color="secondary" className="text-gray-600 leading-relaxed">
        CORIA kullanıcı verilerini KVKK ve GDPR uyumluluğu kapsamında işler. Yakında yayınlanacak tam metin burada yer alacak; o zamana kadar destek ekibimizden detaylı doküman talep edebilirsiniz.
      </Text>
    </Container>
  );
}
