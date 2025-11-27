import { Profile, Opportunity } from '@/types';

export interface OpportunityMatch {
  opportunity: Opportunity;
  score: number;
  reasons: string[];
}

export interface CompatibilityScore {
  score: number;
  reasons: string[];
  level: 'high' | 'medium' | 'low';
}

class RecommendationService {
  /**
   * Calculate match score between user and opportunity
   */
  calculateOpportunityMatch(user: Profile, opportunity: Opportunity): OpportunityMatch {
    let score = 0;
    const reasons: string[] = [];

    // Role-based matching (highest weight)
    const roleMatches: Record<string, string[]> = {
      'Entrepreneur': ['Funding', 'Partnership', 'Mentorship', 'Incubation'],
      'Researcher': ['Partnership', 'Funding', 'Training'],
      'SMME': ['Funding', 'Partnership', 'Tenders', 'Training'],
      'Student': ['Internships', 'Bursaries', 'Training', 'Employment'],
      'Investor': ['Partnership', 'Funding'],
      'Tenant': ['Partnership', 'Training'],
    };

    const preferredTypes = roleMatches[user.role] || [];
    if (preferredTypes.includes(opportunity.type)) {
      score += 40;
      reasons.push(`Perfect match for ${user.role}s`);
    }

    // Bio keyword matching
    if (user.bio && opportunity.description) {
      const bioWords = this.extractKeywords(user.bio.toLowerCase());
      const descWords = this.extractKeywords(opportunity.description.toLowerCase());
      const titleWords = this.extractKeywords(opportunity.title.toLowerCase());
      
      const allOppWords = [...descWords, ...titleWords];
      const matches = bioWords.filter(w => allOppWords.includes(w));
      
      if (matches.length > 0) {
        score += matches.length * 8;
        reasons.push(`Shared interests: ${matches.slice(0, 3).join(', ')}`);
      }
    }

    // Organization/Industry matching
    if (user.organization && opportunity.category) {
      const orgLower = user.organization.toLowerCase();
      const catLower = opportunity.category.toLowerCase();
      
      if (orgLower.includes(catLower) || catLower.includes(orgLower)) {
        score += 25;
        reasons.push('Industry match');
      }
    }

    // Sector matching (if available)
    if (opportunity.sectors && user.bio) {
      const bioLower = user.bio.toLowerCase();
      const matchingSectors = opportunity.sectors.filter(sector => 
        bioLower.includes(sector.toLowerCase())
      );
      
      if (matchingSectors.length > 0) {
        score += matchingSectors.length * 10;
        reasons.push(`Sector match: ${matchingSectors.slice(0, 2).join(', ')}`);
      }
    }

    // Recency bonus (newer opportunities get slight boost)
    if (opportunity.created_at) {
      const daysSinceCreation = (Date.now() - new Date(opportunity.created_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation < 7) {
        score += 5;
        reasons.push('Recently posted');
      }
    }

    // Deadline urgency (if deadline is approaching)
    if (opportunity.deadline) {
      const daysUntilDeadline = (new Date(opportunity.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      if (daysUntilDeadline > 0 && daysUntilDeadline < 14) {
        score += 5;
        reasons.push('Deadline approaching');
      }
    }

    // Cap score at 100
    score = Math.min(score, 100);

    return {
      opportunity,
      score,
      reasons: reasons.length > 0 ? reasons : ['General match'],
    };
  }

  /**
   * Get recommended opportunities for a user
   */
  getRecommendedOpportunities(user: Profile, opportunities: Opportunity[], limit = 5): OpportunityMatch[] {
    const matches = opportunities.map(opp => this.calculateOpportunityMatch(user, opp));
    
    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .filter(match => match.score > 20); // Only show matches with score > 20
  }

  /**
   * Calculate compatibility between two users
   */
  calculateCompatibility(user1: Profile, user2: Profile): CompatibilityScore {
    let score = 0;
    const reasons: string[] = [];

    // Role compatibility (complementary roles score higher)
    const roleCompatibility: Record<string, { compatible: string[]; high: string[] }> = {
      'Entrepreneur': {
        compatible: ['Investor', 'SMME', 'Researcher', 'Tenant'],
        high: ['Investor', 'SMME'],
      },
      'Investor': {
        compatible: ['Entrepreneur', 'SMME'],
        high: ['Entrepreneur'],
      },
      'SMME': {
        compatible: ['Entrepreneur', 'Investor', 'Tenant', 'Researcher'],
        high: ['Entrepreneur', 'Investor'],
      },
      'Researcher': {
        compatible: ['Entrepreneur', 'SMME', 'Student'],
        high: ['Entrepreneur'],
      },
      'Student': {
        compatible: ['Researcher', 'Entrepreneur', 'SMME'],
        high: ['Researcher'],
      },
      'Tenant': {
        compatible: ['SMME', 'Entrepreneur', 'Researcher'],
        high: ['SMME', 'Entrepreneur'],
      },
    };

    const user1Compat = roleCompatibility[user1.role];
    if (user1Compat) {
      if (user1Compat.high.includes(user2.role)) {
        score += 40;
        reasons.push('Highly complementary roles');
      } else if (user1Compat.compatible.includes(user2.role)) {
        score += 25;
        reasons.push('Complementary roles');
      } else if (user1.role === user2.role) {
        score += 15;
        reasons.push('Same role - peer networking');
      }
    }

    // Bio keyword matching
    if (user1.bio && user2.bio) {
      const words1 = this.extractKeywords(user1.bio.toLowerCase());
      const words2 = this.extractKeywords(user2.bio.toLowerCase());
      const common = words1.filter(w => words2.includes(w) && w.length > 4);
      
      if (common.length > 0) {
        score += common.length * 12;
        reasons.push(`Shared interests: ${common.slice(0, 2).join(', ')}`);
      }
    }

    // Organization matching
    if (user1.organization && user2.organization) {
      if (user1.organization.toLowerCase() === user2.organization.toLowerCase()) {
        score += 20;
        reasons.push('Same organization');
      } else {
        // Check for similar organization names
        const org1Words = user1.organization.toLowerCase().split(' ');
        const org2Words = user2.organization.toLowerCase().split(' ');
        const commonOrgWords = org1Words.filter(w => org2Words.includes(w) && w.length > 3);
        if (commonOrgWords.length > 0) {
          score += 10;
          reasons.push('Similar organizations');
        }
      }
    }

    // Address/Location matching (if available)
    if (user1.address && user2.address) {
      const addr1 = user1.address.toLowerCase();
      const addr2 = user2.address.toLowerCase();
      if (addr1.includes(addr2) || addr2.includes(addr1)) {
        score += 10;
        reasons.push('Same location');
      }
    }

    // Cap score at 100
    score = Math.min(score, 100);

    // Determine level
    let level: 'high' | 'medium' | 'low';
    if (score >= 70) level = 'high';
    else if (score >= 40) level = 'medium';
    else level = 'low';

    return {
      score,
      reasons: reasons.length > 0 ? reasons : ['General compatibility'],
      level,
    };
  }

  /**
   * Extract meaningful keywords from text
   */
  private extractKeywords(text: string): string[] {
    // Remove common stop words
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'been', 'be',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who',
    ]);

    // Extract words (3+ characters, not stop words)
    const words = text
      .split(/[\s,.;:!?()]+/)
      .filter(w => w.length >= 3 && !stopWords.has(w.toLowerCase()))
      .map(w => w.toLowerCase());

    return [...new Set(words)]; // Remove duplicates
  }
}

export const recommendationService = new RecommendationService();

