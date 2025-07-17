import React from 'react';

type ActivityItem = {
  avatar: string;
  avatarColor: string;
  text: string;
  companyName?: string;
  time: string;
};

type ActivityFeedProps = {
  activities?: ActivityItem[];
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  activities = [
    {
      avatar: 'SJ',
      avatarColor: '#ec4899',
      text: 'Sarah Johnson added a new report to',
      companyName: 'Acme Corp',
      time: '2 hours ago'
    },
    {
      avatar: 'DK',
      avatarColor: '#3b82f6',
      text: 'David Kim updated status for',
      companyName: 'TechStart',
      time: '2 hours ago'
    },
    {
      avatar: 'AL',
      avatarColor: '#f59e0b',
      text: 'Amanda Lee added a new stakeholder to',
      companyName: 'Security Audit',
      time: '2 hours ago'
    }
  ] 
}) => {
  return (
    <div className="activity-section">
      <div className="activity-header">
        <div className="section-header">
          <span>Recent Activity</span>
        </div>
        <span className="view-all">View all activity</span>
      </div>
      
      {activities.map((activity, index) => (
        <div className="activity-item" key={index}>
          <div className="user-avatar" style={{ backgroundColor: activity.avatarColor }}>
            {activity.avatar}
          </div>
          <div className="activity-content">
            <div className="activity-text">
              {activity.text} {activity.companyName && (
                <span className="company-name">{activity.companyName}</span>
              )}
            </div>
            <div className="activity-time">{activity.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
