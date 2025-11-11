import mailchimp from '@mailchimp/mailchimp_marketing';

// Initialize Mailchimp only if API key is available
if (process.env.MAILCHIMP_API_KEY) {
  mailchimp.setConfig({
    apiKey: process.env.MAILCHIMP_API_KEY,
    server: process.env.MAILCHIMP_SERVER_PREFIX || 'us1',
  });
}

export interface SubscriberData {
  email: string;
  name?: string;
  tags?: string[];
  mergeFields?: Record<string, any>;
  status?: 'subscribed' | 'unsubscribed' | 'cleaned' | 'pending';
}

export interface CampaignData {
  subject: string;
  title: string;
  content: string;
  fromName: string;
  fromEmail: string;
  toName: string;
  recipients: {
    listId: string;
    segmentOpts?: {
      savedSegmentId?: number;
      match?: 'any' | 'all';
      conditions?: any[];
    };
  };
}

export interface ListMember {
  id: string;
  email_address: string;
  status: string;
  merge_fields: Record<string, any>;
  tags: string[];
  timestamp_signup: string;
  last_changed: string;
  member_rating?: number;
}

/**
 * Check if Mailchimp is configured
 */
export function isMailchimpConfigured(): boolean {
  return !!(process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_LIST_ID);
}

/**
 * Get subscriber hash for email
 */
export function getSubscriberHash(email: string): string {
  return email.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Add subscriber to list
 */
export async function addSubscriber(
  listId: string, 
  subscriberData: SubscriberData
): Promise<{ success: boolean; memberId?: string; error?: string }> {
  if (!isMailchimpConfigured()) {
    console.warn('Mailchimp not configured, skipping subscriber addition');
    return { success: false, error: 'Mailchimp not configured' };
  }

  try {
    const response = await mailchimp.lists.addListMember(listId, {
      email_address: subscriberData.email,
      status: subscriberData.status || 'subscribed',
      merge_fields: {
        FNAME: subscriberData.name?.split(' ')[0] || '',
        LNAME: subscriberData.name?.split(' ').slice(1).join(' ') || '',
        ...subscriberData.mergeFields
      },
      tags: subscriberData.tags || []
    });

    return {
      success: true,
      memberId: response.id
    };
  } catch (error: any) {
    console.error('Error adding subscriber to Mailchimp:', error);
    
    // Handle specific Mailchimp errors
    if (error.status === 400 && error.response?.body?.title === 'Member Exists') {
      return {
        success: true,
        memberId: 'existing'
      };
    }

    return {
      success: false,
      error: error.response?.body?.detail || error.message || 'Unknown error'
    };
  }
}

/**
 * Get subscriber by email
 */
export async function getSubscriber(
  listId: string,
  subscriberHash: string
): Promise<{ success: boolean; subscriber?: ListMember; error?: string }> {
  if (!isMailchimpConfigured()) {
    return { success: false, error: 'Mailchimp not configured' };
  }

  try {
    const response = await mailchimp.lists.getListMember(listId, subscriberHash);
    return {
      success: true,
      subscriber: response as ListMember
    };
  } catch (error: any) {
    if (error.status === 404) {
      return {
        success: true,
        subscriber: undefined
      };
    }
    console.error('Error getting subscriber from Mailchimp:', error);
    return {
      success: false,
      error: error.response?.body?.detail || error.message || 'Unknown error'
    };
  }
}

/**
 * Get subscribers from list
 */
export async function getSubscribers(
  listId: string,
  options: {
    status?: 'subscribed' | 'unsubscribed' | 'cleaned' | 'pending';
    count?: number;
    offset?: number;
    search?: string;
  } = {}
): Promise<{ success: boolean; subscribers?: ListMember[]; total?: number; error?: string }> {
  if (!isMailchimpConfigured()) {
    return { success: false, error: 'Mailchimp not configured' };
  }

  try {
    const params: any = {
      status: options.status || 'subscribed',
      count: options.count || 100,
      offset: options.offset || 0
    };

    const response = await mailchimp.lists.getListMembersInfo(listId, params);
    
    let subscribers = response.members as ListMember[];
    
    // Filter by search if provided
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      subscribers = subscribers.filter((member: ListMember) => {
        const email = member.email_address?.toLowerCase() || '';
        const fname = member.merge_fields?.FNAME?.toLowerCase() || '';
        const lname = member.merge_fields?.LNAME?.toLowerCase() || '';
        return email.includes(searchLower) || fname.includes(searchLower) || lname.includes(searchLower);
      });
    }

    return {
      success: true,
      subscribers,
      total: response.total_items || subscribers.length
    };
  } catch (error: any) {
    console.error('Error getting subscribers from Mailchimp:', error);
    return {
      success: false,
      error: error.response?.body?.detail || error.message || 'Unknown error'
    };
  }
}

/**
 * Update subscriber information
 */
export async function updateSubscriber(
  listId: string,
  subscriberHash: string,
  subscriberData: Partial<SubscriberData>
): Promise<{ success: boolean; error?: string }> {
  if (!isMailchimpConfigured()) {
    return { success: false, error: 'Mailchimp not configured' };
  }

  try {
    await mailchimp.lists.updateListMember(listId, subscriberHash, {
      merge_fields: {
        FNAME: subscriberData.name?.split(' ')[0] || '',
        LNAME: subscriberData.name?.split(' ').slice(1).join(' ') || '',
        ...subscriberData.mergeFields
      },
      status: subscriberData.status
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error updating subscriber in Mailchimp:', error);
    return {
      success: false,
      error: error.response?.body?.detail || error.message || 'Unknown error'
    };
  }
}

/**
 * Remove subscriber from list
 */
export async function removeSubscriber(
  listId: string,
  subscriberHash: string
): Promise<{ success: boolean; error?: string }> {
  if (!isMailchimpConfigured()) {
    return { success: false, error: 'Mailchimp not configured' };
  }

  try {
    await mailchimp.lists.deleteListMember(listId, subscriberHash);
    return { success: true };
  } catch (error: any) {
    console.error('Error removing subscriber from Mailchimp:', error);
    return {
      success: false,
      error: error.response?.body?.detail || error.message || 'Unknown error'
    };
  }
}

/**
 * Add tags to subscriber
 */
export async function addTags(
  listId: string,
  subscriberHash: string,
  tags: string[]
): Promise<{ success: boolean; error?: string }> {
  if (!isMailchimpConfigured()) {
    return { success: false, error: 'Mailchimp not configured' };
  }

  try {
    await mailchimp.lists.updateListMemberTags(listId, subscriberHash, {
      tags: tags.map(tag => ({ name: tag, status: 'active' }))
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error adding tags to subscriber:', error);
    return {
      success: false,
      error: error.response?.body?.detail || error.message || 'Unknown error'
    };
  }
}

/**
 * Remove tags from subscriber
 */
export async function removeTags(
  listId: string,
  subscriberHash: string,
  tags: string[]
): Promise<{ success: boolean; error?: string }> {
  if (!isMailchimpConfigured()) {
    return { success: false, error: 'Mailchimp not configured' };
  }

  try {
    await mailchimp.lists.updateListMemberTags(listId, subscriberHash, {
      tags: tags.map(tag => ({ name: tag, status: 'inactive' }))
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error removing tags from subscriber:', error);
    return {
      success: false,
      error: error.response?.body?.detail || error.message || 'Unknown error'
    };
  }
}

/**
 * Create campaign
 */
export async function createCampaign(
  campaignData: CampaignData
): Promise<{ success: boolean; campaignId?: string; error?: string }> {
  if (!isMailchimpConfigured()) {
    return { success: false, error: 'Mailchimp not configured' };
  }

  try {
    const response = await mailchimp.campaigns.create({
      type: 'regular',
      recipients: campaignData.recipients,
      settings: {
        subject_line: campaignData.subject,
        title: campaignData.title,
        from_name: campaignData.fromName,
        reply_to: campaignData.fromEmail,
        to_name: campaignData.toName
      },
      content_type: 'html',
      content: {
        html: campaignData.content
      }
    });

    return {
      success: true,
      campaignId: response.id
    };
  } catch (error: any) {
    console.error('Error creating campaign in Mailchimp:', error);
    return {
      success: false,
      error: error.response?.body?.detail || error.message || 'Unknown error'
    };
  }
}

/**
 * Send campaign
 */
export async function sendCampaign(
  campaignId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await mailchimp.campaigns.send(campaignId);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending campaign in Mailchimp:', error);
    return {
      success: false,
      error: error.response?.body?.detail || error.message || 'Unknown error'
    };
  }
}

/**
 * Sync member to Mailchimp (add or update)
 */
export async function syncMemberToMailchimp(
  listId: string,
  subscriberData: SubscriberData
): Promise<{ success: boolean; memberId?: string; error?: string }> {
  const subscriberHash = getSubscriberHash(subscriberData.email);
  const existing = await getSubscriber(listId, subscriberHash);
  
  if (existing.success && existing.subscriber) {
    // Update existing subscriber
    return await updateSubscriber(listId, subscriberHash, subscriberData);
  } else {
    // Add new subscriber
    return await addSubscriber(listId, subscriberData);
  }
}

export default {
  addSubscriber,
  getSubscriber,
  getSubscribers,
  getSubscriberHash,
  updateSubscriber,
  removeSubscriber,
  addTags,
  removeTags,
  createCampaign,
  sendCampaign,
  syncMemberToMailchimp
};
