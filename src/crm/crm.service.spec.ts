import { CrmService } from './crm.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CrmService - direct method test', () => {
  const service = new CrmService();

  it('should return customer_types when found', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        data: [{ customer_types: 'vip' }],
      },
    });

    const result = await service.findCustomerRankByUserId('KH001');
    expect(result).toBe('vip');
  });

  it('should return null when not found', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        data: [],
      },
    });

    const result = await service.findCustomerRankByUserId('KH002');
    expect(result).toBeNull();
  });

  it('should return null on axios error', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

    const result = await service.findCustomerRankByUserId('KH003');
    expect(result).toBeNull();
  });
});
