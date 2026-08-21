using BookStore.Server.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using System.Net;

namespace BookStore.Server.Services
{
    public class FtpImageService
    {
        private readonly FtpSettings _settings;

        public FtpImageService(IOptions<FtpSettings> options)
        {
            _settings = options.Value;
        }

        public async Task<string?> UploadImageAsync(IFormFile image)
        {
            if (image == null || image.Length == 0)
                return null;

            var extension = Path.GetExtension(image.FileName);

            var fileName =
                $"{Guid.NewGuid()}{extension}";

            var remotePath =
                $"{_settings.RemoteFolder.TrimEnd('/')}/{fileName}";

            var ftpUri =
                $"ftp://{_settings.Host}{remotePath}";

            var request =
                (FtpWebRequest)WebRequest.Create(ftpUri);

            request.Method =
                WebRequestMethods.Ftp.UploadFile;

            request.Credentials =
                new NetworkCredential(
                    _settings.Username,
                    _settings.Password);

            request.UseBinary = true;
            request.UsePassive = true;
            request.KeepAlive = false;

            using (var requestStream =
                   await request.GetRequestStreamAsync())
            {
                await image.CopyToAsync(requestStream);
            }

            return
                $"{_settings.PublicBaseUrl.TrimEnd('/')}/{fileName}";
        }
    }
}