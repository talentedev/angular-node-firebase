import { Injectable } from '@angular/core';
import { createClient, Entry } from 'contentful';

const CONFIG = {
    space: 'm4n2h3vkwtpu',
    accessToken: '34c42f25e726dd3c65db575634cd9fe3dd4aa0fcc893f3a258e35f90cb259099',
    host: 'preview.contentful.com',

    contentTypeIds: {
        charity: 'charity',
        category: 'category'
    }
};

@Injectable()
export class ContentfulPreviewService {

    private cdaClient = createClient({
        space: CONFIG.space,
        accessToken: CONFIG.accessToken,
        host: CONFIG.host
    });

    constructor() { }

    previewCharityDetail(charityId): Promise<Entry<any>> {
        return this.cdaClient.getEntries(Object.assign({
            content_type: CONFIG.contentTypeIds.charity
        }, { 'fields.slug': charityId }))
            .then(res => res.items[0]);
    }
}
