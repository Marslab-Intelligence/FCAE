import type { Metadata } from 'next';
import { RaiseTicketFlow } from './RaiseTicketFlow';

export const metadata: Metadata = {
  title: 'Raise a Ticket — SID Managed Cloud',
};

export default function RaiseTicketPage() {
  return <RaiseTicketFlow />;
}
