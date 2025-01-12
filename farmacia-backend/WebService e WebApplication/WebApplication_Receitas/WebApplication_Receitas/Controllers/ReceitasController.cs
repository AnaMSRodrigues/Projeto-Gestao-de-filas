using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;



namespace WebService_Receitas.Controllers
{
    public class Receitas
    {
        public int id_pro;
        public ulong numero_receita;
        public int pin_acesso; 
        public int pin_opcao;
        public string nome_produto;
        public string data;
    }

    public static class DateTimeExtensions
    {
        public static string ToCustomDateString(this DateTime date)
        {
            return date.ToString("dd-MM-yyyy");
        }
    }

    public class ReceitasController : ApiController
    {

        private static List<Receitas> listareceitas = new List<Receitas>();
        private static int n = 0;

        public void Insert()
        {
            Receitas st = new Receitas
            {
                id_pro= 1,
                numero_receita = 1234567890098765432,
                pin_acesso= 123456,
                pin_opcao=2345,
                nome_produto = "Ben-u-Ron ",
                data= DateTime.Now.Date.ToCustomDateString(),
            };
            Receitas st2 = new Receitas
            {
                id_pro = 2,
                numero_receita = 9987654321123456789,
                pin_acesso = 654321,
                pin_opcao = 1234,
                nome_produto = "Brufen",
                data = DateTime.Now.Date.AddDays(1).ToCustomDateString(),
            };
            Receitas st3 = new Receitas
            {
                id_pro = 3,
                numero_receita = 4567890123456789089,
                pin_acesso = 567890,
                pin_opcao = 3432,
                nome_produto = "Victan",
                data = DateTime.Now.Date.AddDays(7).ToCustomDateString(),
            };

            AdicionarReceitasSeNaoExistir(st);
            AdicionarReceitasSeNaoExistir(st2);
            AdicionarReceitasSeNaoExistir(st3);

        }


        public void AdicionarReceitasSeNaoExistir(Receitas novaReceita)
        {

            if (!listareceitas.Any(x => x.id_pro == novaReceita.id_pro))
            {
                listareceitas.Add(novaReceita);
            }
        }


        public IEnumerable<Receitas> Get()
        {
            Insert();
            return listareceitas;
        }



        public IHttpActionResult Get(ulong numero_rec, int pin_ace, int pin_op)
        {
            // Validações iniciais
            if (numero_rec < 1000000000000000000 || numero_rec > 9999999999999999999)
            {
                return BadRequest("O número da receita (numero_rec) deve ter exatamente 19 dígitos.");
            }

            if (pin_ace < 100000 || pin_ace > 999999)
            {
                return BadRequest("O PIN de acesso (pin_ace) deve ter exatamente 6 dígitos.");
            }

            if (pin_op < 1000 || pin_op > 9999)
            {
                return BadRequest("O PIN de opção (pin_op) deve ter exatamente 4 dígitos.");
            }

            // Chama o método Insert após validações
            try
            {
                Insert();
            }
            catch (Exception ex)
            {
                // Loga a exceção se necessário
                return InternalServerError(new Exception("Ocorreu um erro ao inserir os dados. Detalhes: " + ex.Message));
            }
            
            var ocorrencias = listareceitas
            .Where(receitas =>
            receitas.numero_receita == numero_rec &&
            receitas.pin_acesso == pin_ace &&
            receitas.pin_opcao == pin_op)
            .Select(receitas => new
            {
             receitas.id_pro,
            receitas.nome_produto,
            receitas.data
            })
            .ToList();


            // Retorna resultados ou mensagem de erro
            if (!ocorrencias.Any())
            {
                return Content(HttpStatusCode.NotFound, "Não existe nenhum medicamento com esse ID.");
            }

            return Ok(ocorrencias);
        }

    }
}

