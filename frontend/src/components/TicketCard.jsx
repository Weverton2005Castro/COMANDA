import React from 'react';

export default function TicketCard({ children, className = '', number, timestamp, tilted = false, as: Tag = 'section' }) {
  return (
    <Tag className={`ticket-card ${tilted ? 'ticket-card-tilted' : ''} ${className}`.trim()}>
      {(number || timestamp) && <div className="ticket-stub"><span>comanda <b>{number || 'sistema'}</b></span><span>{timestamp}</span></div>}
      {children}
      <div className="ticket-perforation" aria-hidden="true" />
    </Tag>
  );
}
