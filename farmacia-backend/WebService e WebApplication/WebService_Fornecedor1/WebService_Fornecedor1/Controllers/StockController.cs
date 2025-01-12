using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;


namespace WebService_Fornecedor1.Controllers
{
    public class Stock
    {
        public int id_produto;
        public string nome_produto;
        public string disponibilidade;
        public string tempo_entrega; 
    }

    public static class DateTimeExtensions
    {
        public static string ToCustomDateString(this DateTime date)
        {
            return date.ToString("dd-MM-yyyy");
        }
    }

    public class StockController : ApiController
    {

        private static List<Stock> listastocks = new List<Stock>();
        private static int n = 0;
        
        public void Insert()
        {
            Stock st = new Stock
            {
                id_produto = 1,
                nome_produto = "Ben-u-Ron ",
                disponibilidade = "Disponivel",
                tempo_entrega = DateTime.Now.Date.ToCustomDateString(),
            };
            Stock st2 = new Stock
            {
                id_produto = 2,
                nome_produto = "Brufen",
                disponibilidade = "Disponivel",
                tempo_entrega = DateTime.Now.Date.AddDays(1).ToCustomDateString(),
            };
            Stock st3 = new Stock
            {
                id_produto = 3,
                nome_produto = "Victan",
                disponibilidade = "Indisponivel",
                tempo_entrega = DateTime.Now.Date.AddDays(7).ToCustomDateString(),
            };

            AdicionarStockSeNaoExistir(st);
            AdicionarStockSeNaoExistir(st2);
            AdicionarStockSeNaoExistir(st3);

        }


        public void AdicionarStockSeNaoExistir(Stock novoStock)
        {
            
            if (!listastocks.Any(x => x.id_produto == novoStock.id_produto))
            {
                listastocks.Add(novoStock);
            }
        }


        public IEnumerable<Stock> Get()
        {
            Insert();
            return listastocks;
        }


       
        public IHttpActionResult Get(int id_pro)
        {
            Insert();
            if (id_pro <= 0)
            {
                // Retorna um código 400 com uma mensagem personalizada
                return BadRequest("O ID deve ser maior que zero.");
            }

            var ocorrencias = listastocks
                .Where(stock => stock.id_produto == id_pro)
                .ToList();

            if (!ocorrencias.Any())
            {
                return Content(HttpStatusCode.NotFound, "Não existe nenhum medicamento com esse ID.");

            }
            return Ok(ocorrencias);
        }


        //POST api/values
        //public void Post([FromBody] string value)
        //{

        //}


        //// PUT api/values/5
        //public void Put(int id, [FromBody] string value)
        //{
        //}

        //// DELETE api/values/5
        //public void Delete(int id)
        //{
        //}
    }
}
