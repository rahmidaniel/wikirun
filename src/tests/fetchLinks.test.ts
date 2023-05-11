import axios from 'axios';
import {fetchLinks} from "../api/links/fetchLinks";

describe('fetchLinks', () => {
    test('returns an array of links', async () => {
        const response = { data: { query: { pages: [ { links: [ { title: 'Link 1' }, { title: 'Link 2' } ] } ] } } };
        jest.spyOn(axios, 'get').mockResolvedValue(response);

        const links = await fetchLinks('Egypt');
        expect(links).toContain("Africa");
    });

    test('returns an empty array when no links are found', async () => {
        const response = { data: { query: { pages: [ { links: [] } ] } } };
        jest.spyOn(axios, 'get').mockResolvedValue(response);

        const links = await fetchLinks('Page 1');
        expect(links).toEqual([]);
    });

    test('throws an error when the API call fails', async () => {
        const error = new Error('API call failed');
        jest.spyOn(axios, 'get').mockRejectedValue(error);

        await expect(fetchLinks('Page 1')).rejects.toThrow('API call failed');
    });
});
