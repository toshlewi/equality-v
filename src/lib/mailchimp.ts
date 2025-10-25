import mailchimp from '@mailchimp/mailchimp_marketing';

// Initialize Mailchimp
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX || 'us1',
});

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
}

/**
 * Add subscriber to list
 */
export async function addSubscriber(
  listId: string, 
  subscriberData: SubscriberData
): Promise<{ success: boolean; memberId?: string; error?: string }> {
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
 * Update subscriber information
 */
export async function updateSubscriber(
  listId: string,
  subscriberHash: string,
  subscriberData: Partial<SubscriberData>
): Promise<{ success: boolean; error?: string }> {
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
 * Get subscriber information
 */
export async function getSubscriber(
  listId: string,
  subscriberHash: string
): Promise<{ success: boolean; subscriber?: ListMember; error?: string }> {
  try {
    const subscriber = await mailchimp.lists.getListMember(listId, subscriberHash);
    return {
      success: true,
      subscriber: subscriber as ListMember
    };
  } catch (error: any) {
    console.error('Error getting subscriber from Mailchimp:', error);
    return {
      success: false,
      error: error.response?.body?.detail || error.message || 'Unknown error'
    };
  }
}

/**
 * Get list members with pagination
 */
export async function getListMembers(
  listId: string,
  options: {
    count?: number;
    offset?: number;
    status?: 'subscribed' | 'unsubscribed' | 'cleaned' | 'pending';
    tags?: string[];
  } = {}
): Promise<{ success: boolean; members?: ListMember[]; totalItems?: number; error?: string }> {
  try {
    const response = await mailchimp.lists.getListMembersInfo(listId, {
      count: options.count || 10,
      offset: options.offset || 0,
      status: options.status
    });

    return {
      success: true,
      members: response.members as ListMember[],
      totalItems: response.total_items
    };
  } catch (error: any) {
    console.error('Error getting list members from Mailchimp:', error);
    return {
      success: false,
      error: error.response?.body?.detail || error.message || 'Unknown error'
    };
  }
}

/**
 * Create a campaign
 */
export async function createCampaign(
  campaignData: CampaignData
): Promise<{ success: boolean; campaignId?: string; error?: string }> {
  try {
    const campaign = await mailchimp.campaigns.create({
      type: 'regular',
      recipients: campaignData.recipients,
      settings: {
        subject_line: campaignData.subject,
        title: campaignData.title,
        from_name: campaignData.fromName,
        reply_to: campaignData.fromEmail,
        to_name: campaignData.toName
      }
    });

    return {
      success: true,
      campaignId: campaign.id
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
 * Set campaign content
 */
export async function setCampaignContent(
  campaignId: string,
  content: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await mailchimp.campaigns.setContent(campaignId, {
      html: content
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error setting campaign content in Mailchimp:', error);
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
 * Get list information
 */
export async function getListInfo(
  listId: string
): Promise<{ success: boolean; list?: any; error?: string }> {
  try {
    const list = await mailchimp.lists.getList(listId);
    return {
      success: true,
      list
    };
  } catch (error: any) {
    console.error('Error getting list info from Mailchimp:', error);
    return {
      success: false,
      error: error.response?.body?.detail || error.message || 'Unknown error'
    };
  }
}

/**
 * Create a segment
 */
export async function createSegment(
  listId: string,
  name: string,
  conditions: any[]
): Promise<{ success: boolean; segmentId?: number; error?: string }> {
  try {
    const segment = await mailchimp.lists.createSegment(listId, {
      name,
      options: {
        match: 'all',
        conditions
      }
    });

    return {
      success: true,
      segmentId: segment.id
    };
  } catch (error: any) {
    console.error('Error creating segment in Mailchimp:', error);
    return {
      success: false,
      error: error.response?.body?.detail || error.message || 'Unknown error'
    };
  }
}

/**
 * Get subscriber hash from email
 */
export function getSubscriberHash(email: string): string {
  const crypto = require('crypto');
  return crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
}

/**
 * Sync member to Mailchimp with appropriate tags
 */
export async function syncMemberToMailchimp(
  memberData: {
    email: string;
    name: string;
    membershipType: string;
    isActive: boolean;
    tags?: string[];
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const listId = process.env.MAILCHIMP_LIST_ID!;
    const subscriberHash = getSubscriberHash(memberData.email);
    
    // Determine tags based on membership type and status
    const tags = [
      'member',
      `member_${memberData.membershipType}`,
      memberData.isActive ? 'active' : 'inactive',
      ...(memberData.tags || [])
    ];

    // Add or update subscriber
    const result = await addSubscriber(listId, {
      email: memberData.email,
      name: memberData.name,
      tags,
      status: memberData.isActive ? 'subscribed' : 'unsubscribed'
    });

    if (!result.success) {
      return result;
    }

    // If member exists, update tags
    if (result.memberId === 'existing') {
      const updateResult = await addTags(listId, subscriberHash, tags);
      return updateResult;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error syncing member to Mailchimp:', error);
    return {
      success: false,
      error: error.message || 'Unknown error'
    };
  }
}

// Add subscriber to default list (alias for addSubscriber)
export const addSubscriberToDefaultList = async (subscriberData: SubscriberData): Promise<{ success: boolean; memberId?: string; error?: string }> => {
  const listId = process.env.MAILCHIMP_LIST_ID!;
  return addSubscriber(listId, subscriberData);
};

export default {
  addSubscriber,
  updateSubscriber,
  removeSubscriber,
  addTags,
  removeTags,
  getSubscriber,
  getListMembers,
  createCampaign,
  setCampaignContent,
  sendCampaign,
  getListInfo,
  createSegment,
  getSubscriberHash,
  syncMemberToMailchimp
};
