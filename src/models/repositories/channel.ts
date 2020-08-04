import { EntityRepository, Repository } from 'typeorm';
import { Channel } from '../entities/channel';
import { ensure } from '../../prelude/ensure';
import { SchemaType } from '../../misc/schema';
import { DriveFiles } from '..';

export type PackedChannel = SchemaType<typeof packedChannelSchema>;

@EntityRepository(Channel)
export class ChannelRepository extends Repository<Channel> {
	public async pack(
		src: Channel['id'] | Channel,
	): Promise<PackedChannel> {
		const channel = typeof src === 'object' ? src : await this.findOne(src).then(ensure);

		const banner = channel.bannerId ? await DriveFiles.findOne(channel.bannerId) : null;

		return {
			id: channel.id,
			createdAt: channel.createdAt.toISOString(),
			lastNotedAt: channel.lastNotedAt ? channel.lastNotedAt.toISOString() : null,
			name: channel.name,
			description: channel.description,
			userId: channel.userId,
			bannerUrl: banner ? DriveFiles.getPublicUrl(banner, false) : null,
			usersCount: channel.usersCount,
			notesCount: channel.notesCount,
		};
	}
}

export const packedChannelSchema = {
	type: 'object' as const,
	optional: false as const, nullable: false as const,
	properties: {
		id: {
			type: 'string' as const,
			optional: false as const, nullable: false as const,
			format: 'id',
			description: 'The unique identifier for this Channel.',
			example: 'xxxxxxxxxx',
		},
		createdAt: {
			type: 'string' as const,
			optional: false as const, nullable: false as const,
			format: 'date-time',
			description: 'The date that the Channel was created.'
		},
		lastNotedAt: {
			type: 'string' as const,
			optional: false as const, nullable: true as const,
			format: 'date-time',
		},
		name: {
			type: 'string' as const,
			optional: false as const, nullable: false as const,
			description: 'The name of the Channel.'
		},
		description: {
			type: 'string' as const,
			nullable: true as const, optional: false as const,
		},
		bannerUrl: {
			type: 'string' as const,
			format: 'url',
			nullable: true as const, optional: false as const,
		},
		notesCount: {
			type: 'number' as const,
			nullable: false as const, optional: false as const,
		},
		usersCount: {
			type: 'number' as const,
			nullable: false as const, optional: false as const,
		},
		userId: {
			type: 'string' as const,
			nullable: false as const, optional: false as const,
			format: 'id',
		},
	},
};
