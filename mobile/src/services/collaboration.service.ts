import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';

// ==========================
// TYPES & INTERFACES
// ==========================

export interface CollaborationProject {
	id: string;
	name: string;
	description?: string;
	type: 'pitch' | 'partnership' | 'funding' | 'mentorship' | 'general';
	status: 'active' | 'archived' | 'completed';
	owner_id: string;
	created_at: string;
	updated_at: string;
	members?: CollaborationProjectMember[];
	memberCount?: number;
	boards?: CollaborationBoard[];
	activities?: CollaborationActivity[];
}

export interface CollaborationProjectMember {
	id: string;
	project_id: string;
	user_id: string;
	role: 'owner' | 'editor' | 'viewer' | 'member';
	joined_at: string;
	user?: Profile;
}

export interface CollaborationBoard {
	id: string;
	project_id: string;
	title: string;
	description?: string;
	board_type: 'kanban' | 'list' | 'timeline' | 'table';
	position: number;
	created_by?: string;
	created_at: string;
	updated_at: string;
	tasks?: CollaborationTask[];
}

export interface CollaborationTask {
	id: string;
	board_id: string;
	project_id: string;
	title: string;
	description?: string;
	status: 'todo' | 'in_progress' | 'review' | 'done';
	priority: 'low' | 'medium' | 'high' | 'critical';
	assigned_to?: string;
	due_date?: string;
	position: number;
	created_by?: string;
	created_at: string;
	updated_at: string;
	assignees?: CollaborationTaskAssignment[];
	comments?: CollaborationTaskComment[];
	files?: CollaborationFile[];
	assignedUser?: Profile;
}

export interface CollaborationTaskAssignment {
	id: string;
	task_id: string;
	user_id: string;
	assigned_at: string;
	user?: Profile;
}

export interface CollaborationFile {
	id: string;
	project_id: string;
	task_id?: string;
	file_name: string;
	file_url: string;
	file_type?: string;
	file_size?: number;
	uploaded_by?: string;
	version: number;
	created_at: string;
	updated_at: string;
	uploadedByUser?: Profile;
	comments?: CollaborationFileComment[];
}

export interface CollaborationFileComment {
	id: string;
	file_id: string;
	user_id: string;
	comment: string;
	created_at: string;
	updated_at: string;
	user?: Profile;
}

export interface CollaborationTaskComment {
	id: string;
	task_id: string;
	user_id: string;
	comment: string;
	created_at: string;
	updated_at: string;
	user?: Profile;
}

export interface CollaborationActivity {
	id: string;
	project_id: string;
	user_id?: string;
	activity_type: string;
	entity_type?: string;
	entity_id?: string;
	details?: any;
	created_at: string;
	user?: Profile;
}

// ==========================
// COLLABORATION SERVICE
// ==========================

class CollaborationService {
	// ===== PROJECT MANAGEMENT =====

	async createProject(
		name: string,
		description: string | undefined,
		type: 'pitch' | 'partnership' | 'funding' | 'mentorship' | 'general',
		owner_id: string,
		memberIds: string[] = []
	): Promise<CollaborationProject> {
		console.log('CollaborationService.createProject called:', { name, type, owner_id });

		const { data: project, error: projectError } = await supabase
			.from('collaboration_projects')
			.insert({
				name,
				description,
				type,
				owner_id,
			})
			.select()
			.single();

		if (projectError) {
			console.error('CollaborationService.createProject error:', projectError);
			throw projectError;
		}

		// Add owner as member
		const membersList = [owner_id, ...memberIds];
		const uniqueMembers = Array.from(new Set(membersList));

		const { error: membersError } = await supabase
			.from('collaboration_project_members')
			.insert(
				uniqueMembers.map((userId, index) => ({
					project_id: project.id,
					user_id: userId,
					role: userId === owner_id ? 'owner' : 'member',
				}))
			);

		if (membersError) {
			console.error('CollaborationService.createProject members error:', membersError);
			// Don't throw - project is created, members might have issues with permissions
		}

		// Log activity
		await this.logActivity(project.id, owner_id, 'created_project', 'project', project.id);

		return project as CollaborationProject;
	}

	async getProject(projectId: string): Promise<CollaborationProject | null> {
		console.log('CollaborationService.getProject called:', projectId);

		const { data: project, error: projectError } = await supabase
			.from('collaboration_projects')
			.select('*')
			.eq('id', projectId)
			.single();

		if (projectError) {
			console.error('CollaborationService.getProject error:', projectError);
			return null;
		}

		// Get members
		const { data: members } = await supabase
			.from('collaboration_project_members')
			.select('*, user:profiles(*)')
			.eq('project_id', projectId);

		// Get boards
		const { data: boards } = await supabase
			.from('collaboration_boards')
			.select('*')
			.eq('project_id', projectId)
			.order('position');

		return {
			...project,
			members: members || [],
			memberCount: members?.length || 0,
			boards: boards || [],
		} as CollaborationProject;
	}

	async getUserProjects(userId: string): Promise<CollaborationProject[]> {
		console.log('CollaborationService.getUserProjects called:', userId);

		const { data: memberships, error: membershipsError } = await supabase
			.from('collaboration_project_members')
			.select('project_id')
			.eq('user_id', userId);

		if (membershipsError) {
			console.error('CollaborationService.getUserProjects error:', membershipsError);
			throw membershipsError;
		}

		if (!memberships || memberships.length === 0) {
			return [];
		}

		const projectIds = memberships.map(m => m.project_id);

		const { data: projects, error: projectsError } = await supabase
			.from('collaboration_projects')
			.select('*')
			.in('id', projectIds)
			.order('updated_at', { ascending: false });

		if (projectsError) {
			console.error('CollaborationService.getUserProjects projects error:', projectsError);
			throw projectsError;
		}

		return projects || [];
	}

	async updateProject(
		projectId: string,
		updates: Partial<CollaborationProject>
	): Promise<CollaborationProject> {
		console.log('CollaborationService.updateProject called:', projectId);

		const { data: project, error: updateError } = await supabase
			.from('collaboration_projects')
			.update(updates)
			.eq('id', projectId)
			.select()
			.single();

		if (updateError) {
			console.error('CollaborationService.updateProject error:', updateError);
			throw updateError;
		}

		return project as CollaborationProject;
	}

	async addProjectMember(projectId: string, userId: string, role: 'editor' | 'viewer' | 'member' = 'member'): Promise<CollaborationProjectMember> {
		console.log('CollaborationService.addProjectMember called:', { projectId, userId, role });

		const { data: member, error: memberError } = await supabase
			.from('collaboration_project_members')
			.insert({
				project_id: projectId,
				user_id: userId,
				role,
			})
			.select()
			.single();

		if (memberError) {
			console.error('CollaborationService.addProjectMember error:', memberError);
			throw memberError;
		}

		await this.logActivity(projectId, userId, 'added_member', 'member', userId);

		return member as CollaborationProjectMember;
	}

	async removeProjectMember(projectId: string, userId: string): Promise<void> {
		console.log('CollaborationService.removeProjectMember called:', { projectId, userId });

		const { error } = await supabase
			.from('collaboration_project_members')
			.delete()
			.eq('project_id', projectId)
			.eq('user_id', userId);

		if (error) {
			console.error('CollaborationService.removeProjectMember error:', error);
			throw error;
		}

		await this.logActivity(projectId, userId, 'removed_member', 'member', userId);
	}

	// ===== BOARD MANAGEMENT =====

	async createBoard(
		projectId: string,
		title: string,
		description: string | undefined,
		boardType: 'kanban' | 'list' | 'timeline' | 'table' = 'kanban',
		createdBy: string
	): Promise<CollaborationBoard> {
		console.log('CollaborationService.createBoard called:', { projectId, title, boardType });

		const { data: boards } = await supabase
			.from('collaboration_boards')
			.select('position')
			.eq('project_id', projectId)
			.order('position', { ascending: false })
			.limit(1);

		const nextPosition = (boards?.[0]?.position || 0) + 1;

		const { data: board, error: boardError } = await supabase
			.from('collaboration_boards')
			.insert({
				project_id: projectId,
				title,
				description,
				board_type: boardType,
				position: nextPosition,
				created_by: createdBy,
			})
			.select()
			.single();

		if (boardError) {
			console.error('CollaborationService.createBoard error:', boardError);
			throw boardError;
		}

		await this.logActivity(projectId, createdBy, 'created_board', 'board', board.id);

		return board as CollaborationBoard;
	}

	async getBoard(boardId: string): Promise<CollaborationBoard | null> {
		console.log('CollaborationService.getBoard called:', boardId);

		const { data: board, error: boardError } = await supabase
			.from('collaboration_boards')
			.select('*')
			.eq('id', boardId)
			.single();

		if (boardError) {
			console.error('CollaborationService.getBoard error:', boardError);
			return null;
		}

		// Get tasks
		const { data: tasks } = await supabase
			.from('collaboration_tasks')
			.select('*, assignedUser:assigned_to(id, name, email, avatar)')
			.eq('board_id', boardId)
			.order('position');

		return {
			...board,
			tasks: tasks || [],
		} as CollaborationBoard;
	}

	async getProjectBoards(projectId: string): Promise<CollaborationBoard[]> {
		console.log('CollaborationService.getProjectBoards called:', projectId);

		const { data: boards, error: boardsError } = await supabase
			.from('collaboration_boards')
			.select('*')
			.eq('project_id', projectId)
			.order('position');

		if (boardsError) {
			console.error('CollaborationService.getProjectBoards error:', boardsError);
			throw boardsError;
		}

		return boards || [];
	}

	// ===== TASK MANAGEMENT =====

	async createTask(
		boardId: string,
		projectId: string,
		title: string,
		description: string | undefined,
		priority: 'low' | 'medium' | 'high' | 'critical' = 'medium',
		dueDate: string | undefined,
		createdBy: string,
		assignedTo?: string
	): Promise<CollaborationTask> {
		console.log('CollaborationService.createTask called:', { boardId, title, priority });

		const { data: tasks } = await supabase
			.from('collaboration_tasks')
			.select('position')
			.eq('board_id', boardId)
			.order('position', { ascending: false })
			.limit(1);

		const nextPosition = (tasks?.[0]?.position || 0) + 1;

		const { data: task, error: taskError } = await supabase
			.from('collaboration_tasks')
			.insert({
				board_id: boardId,
				project_id: projectId,
				title,
				description,
				priority,
				due_date: dueDate,
				created_by: createdBy,
				assigned_to: assignedTo,
				position: nextPosition,
			})
			.select()
			.single();

		if (taskError) {
			console.error('CollaborationService.createTask error:', taskError);
			throw taskError;
		}

		await this.logActivity(projectId, createdBy, 'created_task', 'task', task.id);

		return task as CollaborationTask;
	}

	async updateTask(taskId: string, projectId: string, updates: Partial<CollaborationTask>): Promise<CollaborationTask> {
		console.log('CollaborationService.updateTask called:', taskId);

		const { data: task, error: updateError } = await supabase
			.from('collaboration_tasks')
			.update(updates)
			.eq('id', taskId)
			.select()
			.single();

		if (updateError) {
			console.error('CollaborationService.updateTask error:', updateError);
			throw updateError;
		}

		await this.logActivity(projectId, updates.created_by, 'updated_task', 'task', taskId, updates);

		return task as CollaborationTask;
	}

	async getTask(taskId: string): Promise<CollaborationTask | null> {
		console.log('CollaborationService.getTask called:', taskId);

		const { data: task, error: taskError } = await supabase
			.from('collaboration_tasks')
			.select('*, assignedUser:assigned_to(id, name, email, avatar)')
			.eq('id', taskId)
			.single();

		if (taskError) {
			console.error('CollaborationService.getTask error:', taskError);
			return null;
		}

		// Get comments
		const { data: comments } = await supabase
			.from('collaboration_task_comments')
			.select('*, user:profiles(*)')
			.eq('task_id', taskId)
			.order('created_at');

		// Get files
		const { data: files } = await supabase
			.from('collaboration_files')
			.select('*')
			.eq('task_id', taskId);

		return {
			...task,
			comments: comments || [],
			files: files || [],
		} as CollaborationTask;
	}

	async assignTaskToUser(taskId: string, projectId: string, userId: string): Promise<CollaborationTaskAssignment> {
		console.log('CollaborationService.assignTaskToUser called:', { taskId, userId });

		const { data: assignment, error: assignmentError } = await supabase
			.from('collaboration_task_assignments')
			.insert({
				task_id: taskId,
				user_id: userId,
			})
			.select()
			.single();

		if (assignmentError) {
			console.error('CollaborationService.assignTaskToUser error:', assignmentError);
			throw assignmentError;
		}

		await this.logActivity(projectId, userId, 'assigned_task', 'task', taskId);

		return assignment as CollaborationTaskAssignment;
	}

	async addTaskComment(taskId: string, projectId: string, userId: string, comment: string): Promise<CollaborationTaskComment> {
		console.log('CollaborationService.addTaskComment called:', taskId);

		const { data: taskComment, error: commentError } = await supabase
			.from('collaboration_task_comments')
			.insert({
				task_id: taskId,
				user_id: userId,
				comment,
			})
			.select()
			.single();

		if (commentError) {
			console.error('CollaborationService.addTaskComment error:', commentError);
			throw commentError;
		}

		await this.logActivity(projectId, userId, 'commented_task', 'task', taskId);

		return taskComment as CollaborationTaskComment;
	}

	// ===== FILE MANAGEMENT =====

	async uploadFile(
		projectId: string,
		taskId: string | undefined,
		fileName: string,
		fileUri: string,
		fileType: string,
		uploadedBy: string
	): Promise<CollaborationFile> {
		console.log('CollaborationService.uploadFile called:', { projectId, fileName, fileType });

		try {
			// 1. Upload file to storage
			const response = await fetch(fileUri);
			const blob = await response.blob();
			const fileExt = fileName.split('.').pop() || 'unknown';
			const storagePath = `${projectId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

			const { data: uploadData, error: uploadError } = await supabase.storage
				.from('collaboration-files')
				.upload(storagePath, blob, {
					contentType: blob.type || 'application/octet-stream',
				});

			if (uploadError) {
				console.error('CollaborationService.uploadFile storage error:', uploadError);
				throw uploadError;
			}

			// 2. Get public URL
			const { data: publicUrlData } = supabase.storage
				.from('collaboration-files')
				.getPublicUrl(storagePath);

			// 3. Insert file record
			const { data: file, error: fileError } = await supabase
				.from('collaboration_files')
				.insert({
					project_id: projectId,
					task_id: taskId,
					file_name: fileName,
					file_url: publicUrlData.publicUrl,
					file_type: fileType,
					file_size: blob.size,
					uploaded_by: uploadedBy,
				})
				.select()
				.single();

			if (fileError) {
				console.error('CollaborationService.uploadFile insert error:', fileError);
				throw fileError;
			}

			await this.logActivity(projectId, uploadedBy, 'uploaded_file', 'file', file.id);

			return file as CollaborationFile;
		} catch (error) {
			console.error('CollaborationService.uploadFile error:', error);
			throw error;
		}
	}

	async getProjectFiles(projectId: string): Promise<CollaborationFile[]> {
		console.log('CollaborationService.getProjectFiles called:', projectId);

		const { data: files, error: filesError } = await supabase
			.from('collaboration_files')
			.select('*, uploadedByUser:uploaded_by(id, name, email, avatar)')
			.eq('project_id', projectId)
			.order('created_at', { ascending: false });

		if (filesError) {
			console.error('CollaborationService.getProjectFiles error:', filesError);
			throw filesError;
		}

		return files || [];
	}

	async addFileComment(fileId: string, projectId: string, userId: string, comment: string): Promise<CollaborationFileComment> {
		console.log('CollaborationService.addFileComment called:', fileId);

		const { data: fileComment, error: commentError } = await supabase
			.from('collaboration_file_comments')
			.insert({
				file_id: fileId,
				user_id: userId,
				comment,
			})
			.select()
			.single();

		if (commentError) {
			console.error('CollaborationService.addFileComment error:', commentError);
			throw commentError;
		}

		await this.logActivity(projectId, userId, 'commented_file', 'file', fileId);

		return fileComment as CollaborationFileComment;
	}

	// ===== ACTIVITY LOG =====

	async logActivity(
		projectId: string,
		userId: string | undefined,
		activityType: string,
		entityType?: string,
		entityId?: string,
		details?: any
	): Promise<void> {
		console.log('CollaborationService.logActivity called:', { projectId, activityType });

		const { error } = await supabase.from('collaboration_activity_log').insert({
			project_id: projectId,
			user_id: userId,
			activity_type: activityType,
			entity_type: entityType,
			entity_id: entityId,
			details,
		});

		if (error) {
			console.error('CollaborationService.logActivity error:', error);
			// Don't throw - logging failure shouldn't break main operations
		}
	}

	async getProjectActivity(projectId: string, limit = 50): Promise<CollaborationActivity[]> {
		console.log('CollaborationService.getProjectActivity called:', projectId);

		const { data: activities, error: activitiesError } = await supabase
			.from('collaboration_activity_log')
			.select('*, user:profiles(*)')
			.eq('project_id', projectId)
			.order('created_at', { ascending: false })
			.limit(limit);

		if (activitiesError) {
			console.error('CollaborationService.getProjectActivity error:', activitiesError);
			throw activitiesError;
		}

		return activities || [];
	}
}

export const collaborationService = new CollaborationService();
